import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

import { inyeonLocalTimeResolver, TIMEZONE_DATA_VERSION } from '@inyeon/timezone-resolver';
import { calculateFourPillars } from 'manseryeok';

const OUTPUT_URL = new URL('../data/year-month-differential.v1.json', import.meta.url);
const SOLAR_BOUNDARY_URL = new URL('../data/solar-term-boundaries.v1.json', import.meta.url);
const DIFFERENTIAL_CORPUS_URL = new URL('../data/differential-corpus.v1.json', import.meta.url);
const TIMEZONE_ARTIFACT_URL = new URL('../../timezone-resolver/data/iana-2026c-filtered.json', import.meta.url);
const TIMEZONE_REFERENCE_URL = new URL('../../timezone-resolver/data/iana-reference-fixtures.v1.json', import.meta.url);
const REFERENCE_DATA_VERSION = 'issue-11-year-month-differential-v1';
const MINIMUM_DATE = '1989-01-01';
const MAXIMUM_DATE = '2024-12-31';
const KST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1_000;
const ZONES = ['America/Los_Angeles', 'America/New_York', 'Asia/Seoul'];
const STATES = ['before_primary_boundary', 'at_primary_boundary', 'after_primary_boundary'];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function primaryAtInstant(instant) {
  const projected = new Date(Date.parse(instant) + KST_OFFSET_MILLISECONDS);
  const output = calculateFourPillars({
    year: projected.getUTCFullYear(),
    month: projected.getUTCMonth() + 1,
    day: projected.getUTCDate(),
    hour: projected.getUTCHours(),
    minute: projected.getUTCMinutes(),
    dayBoundary: 'midnight',
  }).toObject();
  return { year: output.year, month: output.month };
}

function offsetAtInstant(zone, instantMilliseconds) {
  const index = zone.untilEpochMilliseconds.findIndex((until) => instantMilliseconds < until);
  if (index < 0) throw new Error(`No timezone offset for ${zone.name}`);
  const offsetSeconds = zone.offsetsSecondsEast[index];
  if (!Number.isSafeInteger(offsetSeconds)) throw new Error(`Invalid timezone offset for ${zone.name}`);
  return offsetSeconds;
}

function localInputAtInstant(zone, instant) {
  const instantMilliseconds = Date.parse(instant);
  const offsetSeconds = offsetAtInstant(zone, instantMilliseconds);
  const local = new Date(instantMilliseconds + offsetSeconds * 1_000).toISOString();
  return {
    localDate: local.slice(0, 10),
    localTime: local.slice(11, 16),
    timePrecision: 'exact',
    calendarKind: 'solar',
    timeZone: zone.name,
    profileVersion: 'korean-saju-v1',
    timezoneDataVersion: TIMEZONE_DATA_VERSION,
    referenceDataVersion: REFERENCE_DATA_VERSION,
  };
}

function resolveExpected(input) {
  const resolution = inyeonLocalTimeResolver.resolve({
    localDate: input.localDate,
    localTime: input.localTime,
    timePrecision: 'exact',
    timeZone: input.timeZone,
    timezoneDataVersion: TIMEZONE_DATA_VERSION,
  });
  if (resolution.status === 'nonexistent') return { status: 'error', errorCode: 'NONEXISTENT_LOCAL_TIME' };
  if (resolution.status !== 'unambiguous' && resolution.status !== 'ambiguous') {
    throw new Error(`Unexpected resolver status ${resolution.status}`);
  }
  const outputs = resolution.candidates.map((candidate) => primaryAtInstant(candidate.instant));
  const unique = outputs.filter((output, index) => (
    outputs.findIndex((candidate) => candidate.year === output.year && candidate.month === output.month) === index
  ));
  if (unique.length > 1) {
    return { status: 'ambiguous', resolution: 'ambiguous-different-outputs', candidateCount: 2, alternatives: unique };
  }
  return {
    status: 'complete',
    resolution: resolution.status === 'ambiguous' ? 'ambiguous-same-output' : 'unambiguous',
    candidateCount: resolution.candidates.length,
    pillars: unique[0],
  };
}

const [solarText, differentialText, timezoneText, timezoneReferenceText] = await Promise.all([
  readFile(SOLAR_BOUNDARY_URL, 'utf8'),
  readFile(DIFFERENTIAL_CORPUS_URL, 'utf8'),
  readFile(TIMEZONE_ARTIFACT_URL, 'utf8'),
  readFile(TIMEZONE_REFERENCE_URL, 'utf8'),
]);
const solar = JSON.parse(solarText);
const differential = JSON.parse(differentialText);
const timezone = JSON.parse(timezoneText);
const timezoneReference = JSON.parse(timezoneReferenceText);
if (solar.summary.recordCount !== 432 || solar.supportedRange.minimumYear !== 1989 || solar.supportedRange.maximumYear !== 2024) {
  throw new Error('Issue #10 boundary corpus does not match the Issue #11 validated intersection.');
}
if (timezone.timezoneDataVersion !== TIMEZONE_DATA_VERSION) throw new Error('Timezone artifact version drifted.');
const zoneTables = new Map(timezone.zones.map((zone) => [zone.name, zone]));

const boundaryRecords = [];
for (const boundary of solar.records) {
  for (const zoneName of ZONES) {
    const zone = zoneTables.get(zoneName);
    if (!zone) throw new Error(`Missing timezone artifact for ${zoneName}`);
    for (const state of STATES) {
      const sample = boundary.samples[state];
      const input = localInputAtInstant(zone, sample.utc);
      const resolution = inyeonLocalTimeResolver.resolve({
        localDate: input.localDate,
        localTime: input.localTime,
        timePrecision: 'exact',
        timeZone: input.timeZone,
        timezoneDataVersion: TIMEZONE_DATA_VERSION,
      });
      if ((resolution.status !== 'unambiguous' && resolution.status !== 'ambiguous')
        || !resolution.candidates.some((candidate) => candidate.instant === sample.utc)) {
        throw new Error(`Boundary local-time round trip failed for ${boundary.id} ${zoneName} ${state}`);
      }
      const expected = primaryAtInstant(sample.utc);
      if (JSON.stringify(expected) !== JSON.stringify(sample.primaryOutputHangul)) {
        throw new Error(`Primary output drifted from Issue #10 for ${boundary.id} ${state}`);
      }
      boundaryRecords.push({
        id: `${boundary.id}-${zoneName.replaceAll('/', '-').toLowerCase()}-${state}`,
        boundaryId: boundary.id,
        term: { index: boundary.term.index, nameHangul: boundary.term.nameHangul, nameHanja: boundary.term.nameHanja },
        state,
        input,
        expected: resolveExpected(input),
        assertedInstantExpected: expected,
        primaryBoundaryUtc: boundary.primaryBoundary.utc,
        assertedInstantUtc: sample.utc,
        evidence: {
          timezone: 'pinned IANA 2026c resolver round trip',
          pillarMapping: 'manseryeok 2.0.0 plus sexagenary transition invariants',
          boundaryLocation: 'Astronomy Engine 2.1.19 apparent-Sun longitude locator only',
          comparisonImplementation: 'lunar-javascript 1.7.7 is shared-lineage for solar-term timing and is not a boundary authority',
        },
      });
    }
  }
}
if (boundaryRecords.length !== 3_888) throw new Error(`Expected 3,888 boundary states, received ${boundaryRecords.length}`);

const ordinaryInputs = ZONES.map((timeZone) => ({
  localDate: '2000-06-15', localTime: '12:00', timePrecision: 'exact', calendarKind: 'solar', timeZone,
  profileVersion: 'korean-saju-v1', timezoneDataVersion: TIMEZONE_DATA_VERSION, referenceDataVersion: REFERENCE_DATA_VERSION,
}));
const transitionFixtures = timezoneReference.fixtures.filter((fixture) => (
  (fixture.input.timeZone === 'America/Los_Angeles' || fixture.input.timeZone === 'America/New_York')
  && fixture.input.localDate >= MINIMUM_DATE && fixture.input.localDate <= MAXIMUM_DATE
));
const transitionCases = transitionFixtures.map((fixture) => {
  const input = {
    ...fixture.input, timePrecision: 'exact', calendarKind: 'solar', profileVersion: 'korean-saju-v1',
    timezoneDataVersion: TIMEZONE_DATA_VERSION, referenceDataVersion: REFERENCE_DATA_VERSION,
  };
  return { id: fixture.id, category: fixture.expected.status === 'ambiguous' ? 'fold' : 'gap', input, expected: resolveExpected(input) };
});
const exactIpchun = solar.records.find((record) => record.id === 'jie-2024-02');
if (!exactIpchun) throw new Error('Missing 2024 입춘 boundary.');
const naiveUsRegressionCases = ['America/New_York', 'America/Los_Angeles'].map((zoneName) => {
  const zone = zoneTables.get(zoneName);
  const input = localInputAtInstant(zone, exactIpchun.primaryBoundary.utc);
  const [year, month, day] = input.localDate.split('-').map(Number);
  const [hour, minute] = input.localTime.split(':').map(Number);
  const naive = calculateFourPillars({ year, month, day, hour, minute, dayBoundary: 'midnight' }).toObject();
  return {
    id: `naive-us-civil-as-kst-${zoneName.replaceAll('/', '-').toLowerCase()}`,
    category: 'timezone-normalization-regression',
    input,
    expected: resolveExpected(input),
    knownWrongNaiveCivilAsKst: { year: naive.year, month: naive.month },
  };
});
const rangeCases = [
  {
    id: 'source-local-1988-projects-into-1989', category: 'source-local-spill-accepted',
    input: { ...ordinaryInputs[0], localDate: '1988-12-31', localTime: '16:00' },
    expected: null,
  },
  {
    id: 'source-local-2025-projects-outside-range', category: 'projected-kst-range',
    input: { ...ordinaryInputs[2], localDate: '2025-01-01', localTime: '00:00' },
    expected: { status: 'error', errorCode: 'DATE_OUT_OF_RANGE' },
  },
  {
    id: 'projected-kst-after-maximum', category: 'projected-kst-range',
    input: { ...ordinaryInputs[0], localDate: '2024-12-31', localTime: '23:59' },
    expected: { status: 'error', errorCode: 'DATE_OUT_OF_RANGE' },
  },
];
const edgeCases = [
  ...ordinaryInputs.map((input) => ({ id: `ordinary-${input.timeZone.replaceAll('/', '-').toLowerCase()}`, category: 'ordinary', input, expected: resolveExpected(input) })),
  ...transitionCases,
  ...naiveUsRegressionCases,
  ...rangeCases,
];
rangeCases[0].expected = resolveExpected(rangeCases[0].input);

const referenceComparisons = differential.records
  .filter((record) => record.id.startsWith('term-2024-'))
  .map((record) => {
    const input = {
      localDate: record.input.localDate,
      localTime: record.input.localTime,
      timePrecision: 'exact',
      calendarKind: 'solar',
      timeZone: 'Asia/Seoul',
      profileVersion: 'korean-saju-v1',
      timezoneDataVersion: TIMEZONE_DATA_VERSION,
      referenceDataVersion: REFERENCE_DATA_VERSION,
    };
    const primary = { year: record.primary.output.year, month: record.primary.output.month };
    const comparison = { year: record.comparison.output.year, month: record.comparison.output.month };
    return {
      id: record.id,
      input,
      primary,
      comparison,
      classification: primary.year === comparison.year && primary.month === comparison.month
        ? 'agreement'
        : 'source_reference_inconsistency',
      differingPillars: ['year', 'month'].filter((pillar) => primary[pillar] !== comparison[pillar]),
      evidenceScope: {
        comparisonEngine: 'lunar-javascript 1.7.7',
        separateImplementationForPillarMapping: true,
        independentForSolarTermTiming: false,
        solarTermLineage: 'shared-lineage; not a boundary authority',
        independentBoundaryLocator: {
          engine: 'astronomy-engine 2.1.19',
          assertedProperty: 'apparent-Sun longitude boundary location only',
          primaryBoundaryUtc: record.independentReference.primaryBoundaryUtc,
          comparisonBoundaryUtc: record.independentReference.comparisonBoundaryUtc,
          absoluteDifferenceSeconds: record.independentReference.absoluteDifferenceSeconds,
        },
      },
    };
  });
if (referenceComparisons.length !== 24) throw new Error(`Expected 24 representative comparisons, received ${referenceComparisons.length}`);

const artifact = {
  schemaVersion: 1,
  generatedAt: '2026-09-14',
  adapterVersion: '0.3.0',
  profileVersion: 'korean-saju-v1',
  profileStatus: 'candidate',
  productionEligible: false,
  referenceDataVersion: REFERENCE_DATA_VERSION,
  timezoneResolverVersion: '0.1.0',
  timezoneDataVersion: TIMEZONE_DATA_VERSION,
  supportedIntersection: {
    resolverSourceCivilDate: { minimum: '1908-04-01', maximum: '2026-12-31' },
    projectedKstDate: { minimum: MINIMUM_DATE, maximum: MAXIMUM_DATE },
    timeZones: ZONES,
  },
  sourceArtifacts: {
    solarTermBoundaries: { path: 'solar-term-boundaries.v1.json', sha256: sha256(solarText), recordCount: solar.records.length },
    differentialCorpus: { path: 'differential-corpus.v1.json', sha256: sha256(differentialText), comparisonCount: referenceComparisons.length },
    timezoneTransitions: { path: '../../timezone-resolver/data/iana-2026c-filtered.json', sha256: sha256(timezoneText), transitionTableSha256: timezone.transitionTableSha256 },
    timezoneReferenceFixtures: { path: '../../timezone-resolver/data/iana-reference-fixtures.v1.json', sha256: sha256(timezoneReferenceText) },
  },
  summary: {
    boundaryStateCount: boundaryRecords.length,
    solarBoundaryCount: solar.records.length,
    statesPerBoundary: STATES.length,
    timeZoneCount: ZONES.length,
    ordinaryCaseCount: edgeCases.filter((entry) => entry.category === 'ordinary').length,
    gapCaseCount: edgeCases.filter((entry) => entry.category === 'gap').length,
    foldCaseCount: edgeCases.filter((entry) => entry.category === 'fold').length,
    naiveTimezoneRegressionCount: naiveUsRegressionCases.length,
    rangeCaseCount: rangeCases.length,
    correctionCount: 0,
    representativeReferenceComparisonCount: referenceComparisons.length,
  },
  methodology: {
    normalizedInstantSeam: 'resolver UTC candidate projected to UTC+09 civil fields for the documented public manseryeok KST API; only year/month outputs are retained',
    equality: 'the embedded primary boundary minute belongs to the new month and, at 입춘, the new Saju year',
    corrections: 'none; no upstream year/month defect was demonstrated',
    disagreementPolicy: 'classify and preserve; never average or silently select a competing boundary',
  },
  limitations: [
    'This artifact validates candidate year/month implementation behavior; it does not production-approve a Korean Saju methodology.',
    'Astronomy Engine independently locates only apparent-Sun longitude crossings, not complete Four Pillars charts.',
    'lunar-javascript is a separate pillar implementation but shares solar-term data lineage and is not an independent boundary authority.',
    'Day/hour outputs produced internally by the public upstream API are discarded and are not validated or exposed by this seam.',
    'KASI-aligned or expert methodology review and the Issue #14 release corpus remain pending.',
  ],
  boundaryRecords,
  edgeCases,
  referenceComparisons,
};

const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const committed = await readFile(OUTPUT_URL, 'utf8').catch(() => '');
  if (committed !== serialized) throw new Error('year-month-differential.v1.json is stale; regenerate it without --check');
} else {
  await writeFile(OUTPUT_URL, serialized);
}
