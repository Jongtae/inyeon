import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const moment = require('moment-timezone/moment-timezone-utils.js');
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = require.resolve('moment-timezone/data/packed/latest.json');
const destinationPath = resolve(packageRoot, 'data/iana-2026c-filtered.json');
const runtimeDestinationPath = resolve(packageRoot, 'src/generated-timezone-data.ts');
const zoneNames = ['America/Los_Angeles', 'America/New_York', 'Asia/Seoul'];
const expectedSourceSha256 = '43f7878a298740ff6acabb9c726c7e5431a94bdca79abad274a6fe6e355bfe81';
const sentinelMinimum = Date.UTC(1908, 2, 30);
const sentinelMaximum = Date.UTC(2027, 0, 2);

const sourceBytes = await readFile(sourcePath);
const sourceSha256 = createHash('sha256').update(sourceBytes).digest('hex');
if (sourceSha256 !== expectedSourceSha256) throw new Error('Pinned moment-timezone source data hash does not match the reviewed artifact.');
const source = JSON.parse(sourceBytes.toString('utf8'));
if (source.version !== '2026c') throw new Error('Pinned moment-timezone must contain IANA tzdb 2026c.');

const packedZones = source.zones.filter((packed) => zoneNames.includes(packed.slice(0, packed.indexOf('|'))));
if (packedZones.length !== zoneNames.length || packedZones.some((packed, index) => !packed.startsWith(`${zoneNames[index]}|`))) {
  throw new Error('Could not produce the exact canonical three-zone filter.');
}
const zones = packedZones.map((packed) => {
  const unpacked = moment.tz.unpack(packed);
  const firstIndex = unpacked.untils.findIndex((until) => until > sentinelMinimum);
  const lastIndex = unpacked.untils.findIndex((until) => until > sentinelMaximum);
  if (firstIndex < 0 || lastIndex < firstIndex) throw new Error(`Missing sentinel coverage for ${unpacked.name}.`);
  const offsetsSecondsEast = unpacked.offsets.slice(firstIndex, lastIndex + 1).map((offsetMinutesWest) => {
    const exactSecondsEast = -offsetMinutesWest * 60;
    if (!Number.isSafeInteger(exactSecondsEast)) {
      throw new Error(`Timezone offset cannot be represented as integer seconds for ${unpacked.name}.`);
    }
    return exactSecondsEast;
  });
  return {
    name: unpacked.name,
    sentinelMinimumEpochMilliseconds: sentinelMinimum,
    sentinelMaximumEpochMilliseconds: sentinelMaximum,
    offsetsSecondsEast,
    untilEpochMilliseconds: [...unpacked.untils.slice(firstIndex, lastIndex), sentinelMaximum],
  };
});
for (const zone of zones) {
  if (zone.offsetsSecondsEast.length !== zone.untilEpochMilliseconds.length || zone.offsetsSecondsEast.length === 0) {
    throw new Error(`Invalid transition cardinality for ${zone.name}.`);
  }
  if (zone.offsetsSecondsEast.some((offset) => !Number.isSafeInteger(offset))) {
    throw new Error(`Non-integer offset in ${zone.name}.`);
  }
  if (zone.untilEpochMilliseconds.some((until) => !Number.isSafeInteger(until))) {
    throw new Error(`Non-finite transition in ${zone.name}.`);
  }
  for (let index = 1; index < zone.untilEpochMilliseconds.length; index += 1) {
    if (zone.untilEpochMilliseconds[index] <= zone.untilEpochMilliseconds[index - 1]) {
      throw new Error(`Unsorted or duplicate transition in ${zone.name}.`);
    }
  }

  const offsetAt = (instant) => {
    if (instant < zone.sentinelMinimumEpochMilliseconds || instant >= zone.sentinelMaximumEpochMilliseconds) return null;
    const index = zone.untilEpochMilliseconds.findIndex((until) => instant < until);
    return index < 0 ? null : zone.offsetsSecondsEast[index];
  };
  const candidateCount = (localEpoch) => {
    let count = 0;
    for (const offset of new Set(zone.offsetsSecondsEast)) {
      if (offsetAt(localEpoch - offset * 1_000) === offset) count += 1;
    }
    return count;
  };
  for (let index = 0; index < zone.untilEpochMilliseconds.length - 1; index += 1) {
    const transition = zone.untilEpochMilliseconds[index];
    const beforeLocal = transition + zone.offsetsSecondsEast[index] * 1_000;
    const afterLocal = transition + zone.offsetsSecondsEast[index + 1] * 1_000;
    for (const localEpoch of [beforeLocal - 60_000, beforeLocal, afterLocal, afterLocal + 60_000]) {
      if (candidateCount(localEpoch) > 2) throw new Error(`More than two local-time candidates in ${zone.name}.`);
    }
  }
}
const transitionTableSha256 = createHash('sha256').update(JSON.stringify(zones)).digest('hex');

const artifact = {
  schemaVersion: 1,
  timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
  ianaVersion: '2026c',
  supportedCivilDateRange: { minimum: '1908-04-01', maximum: '2026-12-31' },
  transitionTableSha256,
  source: {
    ianaUrl: 'https://data.iana.org/time-zones/releases/tzdata2026c.tar.gz',
    ianaTarballSha256: 'e4a178a4477f3d0ea77cc31828ff72aa38feff8d61aa13e7e99e142e9d902be4',
    momentTimezoneVersion: '0.6.3',
    momentTimezoneNpmIntegrity: 'sha512-pVEPA/HCFHHbwJ130ywnzYuZpkEGcP6Daa/OwNebpA18MybeFHmQilAGGovXgWijQ8vQtmud9jZrziUBgsykfg==',
    momentTimezonePackedDataSha256: sourceSha256,
    reviewedLatestIanaRelease: {
      version: '2026d',
      sourceUrl: 'https://data.iana.org/time-zones/releases/tzdata2026d.tar.gz',
      sourceSha256: '0cb2aa8e333c3dc049badc42a0c61f21987b8cd44e107fa900bad764aacc7767',
      selectedZoneTransitionDifferenceThrough2026: 'none',
    },
  },
  zones,
};
const output = `${JSON.stringify(artifact, null, 2)}\n`;
const runtimeArtifact = {
  schemaVersion: artifact.schemaVersion,
  timezoneDataVersion: artifact.timezoneDataVersion,
  ianaVersion: artifact.ianaVersion,
  supportedCivilDateRange: artifact.supportedCivilDateRange,
  transitionTableSha256: artifact.transitionTableSha256,
  zones: artifact.zones,
};
const runtimeOutput = `// Generated by scripts/generate-timezone-data.mjs. Do not edit.\nfunction deepFreeze<T>(value: T): T {\n  if (value !== null && typeof value === 'object') {\n    for (const nested of Object.values(value)) deepFreeze(nested);\n    Object.freeze(value);\n  }\n  return value;\n}\n\nexport const generatedTimezoneData = deepFreeze(${JSON.stringify(runtimeArtifact, null, 2)} as const);\n`;

if (process.argv.includes('--check')) {
  const committed = await readFile(destinationPath, 'utf8');
  if (committed !== output) throw new Error('Committed filtered timezone artifact has drifted; run npm run generate:data -w @inyeon/timezone-resolver.');
  const committedRuntime = await readFile(runtimeDestinationPath, 'utf8');
  if (committedRuntime !== runtimeOutput) throw new Error('Committed runtime timezone module has drifted; run npm run generate:data -w @inyeon/timezone-resolver.');
} else {
  await writeFile(destinationPath, output);
  await writeFile(runtimeDestinationPath, runtimeOutput);
}
