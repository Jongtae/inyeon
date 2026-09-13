import { generatedTimezoneData } from './generated-timezone-data.js';

const EXPECTED_TABLE_HASH = '3e64bb05dfb4d8492c10a4ab11ca1cd6566748893998863c94db6deef85064d7';
const EXPECTED_ZONE_NAMES = ['America/Los_Angeles', 'America/New_York', 'Asia/Seoul'] as const;

function invalidArtifact(): never {
  throw new Error('Invalid bundled timezone artifact.');
}

function validateAndOwnArtifact() {
  if (
    generatedTimezoneData.schemaVersion !== 1
    || generatedTimezoneData.timezoneDataVersion !== 'iana-2026c-inyeon-filter-v1'
    || generatedTimezoneData.ianaVersion !== '2026c'
    || generatedTimezoneData.supportedCivilDateRange.minimum !== '1908-04-01'
    || generatedTimezoneData.supportedCivilDateRange.maximum !== '2026-12-31'
    || generatedTimezoneData.transitionTableSha256 !== EXPECTED_TABLE_HASH
    || generatedTimezoneData.zones.length !== EXPECTED_ZONE_NAMES.length
  ) invalidArtifact();

  const ownedZones = generatedTimezoneData.zones.map((zone, zoneIndex) => {
    if (
      zone.name !== EXPECTED_ZONE_NAMES[zoneIndex]
      || !Number.isSafeInteger(zone.sentinelMinimumEpochMilliseconds)
      || !Number.isSafeInteger(zone.sentinelMaximumEpochMilliseconds)
      || zone.sentinelMinimumEpochMilliseconds >= zone.sentinelMaximumEpochMilliseconds
      || zone.offsetsSecondsEast.length !== zone.untilEpochMilliseconds.length
    ) invalidArtifact();
    if (zone.offsetsSecondsEast.some((offset) => !Number.isSafeInteger(offset))) invalidArtifact();
    if (zone.untilEpochMilliseconds.some((until) => !Number.isSafeInteger(until))) invalidArtifact();
    for (let index = 1; index < zone.untilEpochMilliseconds.length; index += 1) {
      if (zone.untilEpochMilliseconds[index]! <= zone.untilEpochMilliseconds[index - 1]!) invalidArtifact();
    }
    return Object.freeze({
      name: zone.name,
      sentinelMinimumEpochMilliseconds: zone.sentinelMinimumEpochMilliseconds,
      sentinelMaximumEpochMilliseconds: zone.sentinelMaximumEpochMilliseconds,
      offsetsSecondsEast: Object.freeze([...zone.offsetsSecondsEast]),
      untilEpochMilliseconds: Object.freeze([...zone.untilEpochMilliseconds]),
    });
  });

  return Object.freeze({
    schemaVersion: generatedTimezoneData.schemaVersion,
    timezoneDataVersion: generatedTimezoneData.timezoneDataVersion,
    ianaVersion: generatedTimezoneData.ianaVersion,
    supportedCivilDateRange: Object.freeze({ ...generatedTimezoneData.supportedCivilDateRange }),
    transitionTableSha256: EXPECTED_TABLE_HASH,
    zones: Object.freeze(ownedZones),
  });
}

export const packedTimezoneData = validateAndOwnArtifact();
