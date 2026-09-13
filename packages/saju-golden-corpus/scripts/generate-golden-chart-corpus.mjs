import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { inyeonSajuAdapter } from '../../saju-adapter/dist/index.js';
import { deriveChartFeatures } from '../../saju-derived-features/dist/index.js';

const outputPath = fileURLToPath(new URL('../data/golden-chart-corpus.v1.json', import.meta.url));
const solarPath = fileURLToPath(new URL('../../saju-adapter/data/solar-term-boundaries.v1.json', import.meta.url));
const yearMonthPath = fileURLToPath(new URL('../../saju-adapter/data/year-month-differential.v1.json', import.meta.url));
const dayHourPath = fileURLToPath(new URL('../../saju-adapter/data/day-hour-evidence.v1.json', import.meta.url));
const timezoneReferencePath = fileURLToPath(new URL('../../timezone-resolver/data/iana-reference-fixtures.v1.json', import.meta.url));
const timezoneDataPath = fileURLToPath(new URL('../../timezone-resolver/data/iana-2026c-filtered.json', import.meta.url));
const check = process.argv.includes('--check');
const ZONES = ['Asia/Seoul', 'America/New_York', 'America/Los_Angeles'];
const BASE = {
  calendarKind: 'solar',
  profileVersion: 'korean-saju-v1',
  timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
  referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
};
const QUOTAS = {
  ordinary: 72,
  'solar-term-boundary': 48,
  'day-rollover': 24,
  'hour-rollover': 36,
  'dst-fold': 12,
  'historical-dst-rule-era': 12,
  'leap-year': 12,
  'decade-sample': 24,
};

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const SOURCE_HASHES = {
  dayHour: sha256(dayHourPath),
  yearMonth: sha256(yearMonthPath),
  solarTerm: sha256(solarPath),
  timezoneReference: sha256(timezoneReferencePath),
  timezoneData: sha256(timezoneDataPath),
};

function dateAt(index, start = '1989-02-10', stepDays = 137) {
  const value = new Date(`${start}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + index * stepDays);
  return value.toISOString().slice(0, 10);
}

function chartInput(zone, temporalSupport, date, time = '12:00', suffix = 0, hour = 12) {
  const common = { temporalSupport, ...BASE, timeZone: zone };
  if (temporalSupport === 'exact') return { ...common, localDate: date, localTime: time };
  if (temporalSupport === 'date-only' || temporalSupport === 'unknown') return { ...common, localDate: date };
  const minute = 10 + suffix % 30;
  const endMinute = minute + 2;
  if (temporalSupport === 'approximate') {
    return { ...common, window: { startLocalDateTime: `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, endLocalDateTime: `${date}T${String(hour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}` } };
  }
  return { ...common, windows: [
    { startLocalDateTime: `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, endLocalDateTime: `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` },
    { startLocalDateTime: `${date}T${String((hour + 12) % 24).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`, endLocalDateTime: `${date}T${String((hour + 12) % 24).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}` },
  ] };
}

function add(specs, primaryCategory, input, evidenceRecordIds = []) {
  specs.push({ primaryCategory, input, evidenceRecordIds });
}

const specs = [];
const modes = ['exact', 'approximate', 'disputed', 'date-only', 'unknown'];
for (let index = 0; index < QUOTAS.ordinary; index += 1) {
  const mode = modes[index % modes.length];
  add(specs, 'ordinary', chartInput(ZONES[index % ZONES.length], mode, dateAt(index), ['06:17', '10:43', '12:26', '18:52'][index % 4], index, 12), []);
}

const solar = JSON.parse(readFileSync(solarPath, 'utf8'));
const yearMonth = JSON.parse(readFileSync(yearMonthPath, 'utf8'));
const dayHour = JSON.parse(readFileSync(dayHourPath, 'utf8'));
const timezoneReference = JSON.parse(readFileSync(timezoneReferencePath, 'utf8'));
const overSixty = solar.records.filter((record) => record.absoluteDeltaMilliseconds > 60_000);
const overSixtyIds = new Set(overSixty.map((record) => record.id));
const year2000 = solar.records.filter((record) => record.year === 2000);
const extraBoundary = solar.records.find((record) => record.year === 2012 && record.term.index === 0);
if (year2000.length !== 12 || overSixty.length !== 3 || !extraBoundary) {
  throw new Error('Solar selection must provide all 12 jie, all three >60-second disagreements, and one extra boundary');
}
const solarPlans = [
  ...year2000.flatMap((boundary) => ['before_primary_boundary', 'at_primary_boundary', 'after_primary_boundary'].map((state) =>
    ({ boundary, state, zone: ZONES[boundary.term.index % 3] }))),
  ...overSixty.flatMap((boundary, boundaryIndex) => ['before_primary_boundary', 'at_primary_boundary', 'after_primary_boundary'].map((state) =>
    ({ boundary, state, zone: ZONES[boundaryIndex] }))),
  ...['before_primary_boundary', 'at_primary_boundary', 'after_primary_boundary'].map((state) =>
    ({ boundary: extraBoundary, state, zone: 'Asia/Seoul' })),
];
if (solarPlans.length !== 48) throw new Error(`Expected 48 solar-boundary plans, got ${solarPlans.length}`);
for (const { boundary, state, zone } of solarPlans) {
    const zoneSlug = zone.toLowerCase().replaceAll('/', '-');
    const recordId = `${boundary.id}-${zoneSlug}-${state}`;
    const record = yearMonth.boundaryRecords.find((candidate) => candidate.id === recordId);
    if (!record) throw new Error(`Missing year/month evidence record ${recordId}`);
    add(specs, 'solar-term-boundary', chartInput(zone, 'exact', record.input.localDate, record.input.localTime), [boundary.id, record.id]);
}

const rolloverDates = ['1989-03-01', '1992-02-29', '1999-12-31', '2000-01-01', '2006-10-29', '2007-11-04', '2012-02-29', '2024-02-29'];
for (let index = 0; index < QUOTAS['day-rollover']; index += 1) {
  add(specs, 'day-rollover', chartInput(ZONES[index % 3], 'exact', rolloverDates[index % rolloverDates.length], ['23:59', '00:00', '00:01'][index % 3]), []);
}
const hourBoundaryTimes = ['01:00', '03:00', '05:00', '07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00'];
for (const [boundaryIndex, boundaryTime] of hourBoundaryTimes.entries()) {
  const boundaryMinutes = Number(boundaryTime.slice(0, 2)) * 60;
  for (const [stateIndex, delta] of [-1, 0, 1].entries()) {
    const minuteOfDay = (boundaryMinutes + delta + 1440) % 1440;
    const time = `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`;
    const state = ['before', 'at', 'after'][stateIndex];
    add(specs, 'hour-rollover', chartInput(ZONES[(boundaryIndex + stateIndex) % 3], 'exact', '2024-06-15', time),
      [`hour-${time.replace(':', '')}-${state}`]);
  }
}

const gapDates = ['2004-04-04', '2005-04-03', '2006-04-02', '2007-03-11', '2012-03-11', '2024-03-10'];
const foldDates = ['2004-10-31', '2005-10-30', '2006-10-29', '2007-11-04', '2012-11-04', '2024-11-03'];
const negativeSpecs = [];
for (let index = 0; index < 12; index += 1) {
  const zone = index % 2 === 0 ? 'America/New_York' : 'America/Los_Angeles';
  negativeSpecs.push({ capability: 'nonexistent-local-time', input: chartInput(zone, 'exact', gapDates[Math.floor(index / 2)], '02:30'),
    evidenceRecordIds: index >= 4 && index <= 7 ? [`${zone.includes('New_York') ? 'new-york' : 'los-angeles'}-${index < 6 ? 'pre' : 'post'}-2007-gap`] : [] });
  add(specs, 'dst-fold', chartInput(zone, 'exact', foldDates[Math.floor(index / 2)], '01:30'),
    index >= 4 && index <= 7 ? [`${zone.includes('New_York') ? 'new-york' : 'los-angeles'}-${index < 6 ? 'pre' : 'post'}-2007-fold`] : []);
}

const eras = [
  ['America/New_York', '1990-01-15'], ['America/Los_Angeles', '1990-07-15'],
  ['America/New_York', '1999-01-15'], ['America/Los_Angeles', '1999-07-15'],
  ['America/New_York', '2006-03-20'], ['America/Los_Angeles', '2006-11-15'],
  ['America/New_York', '2007-03-20'], ['America/Los_Angeles', '2007-11-15'],
  ['America/New_York', '2012-01-15'], ['America/Los_Angeles', '2012-07-15'],
  ['America/New_York', '2024-01-15'], ['America/Los_Angeles', '2024-07-15'],
];
for (const [index, [zone, date]] of eras.entries()) {
  const mode = index < 7 ? 'approximate' : index < 11 ? 'disputed' : 'date-only';
  add(specs, 'historical-dst-rule-era', chartInput(zone, mode, date, '23:30', index, 23), []);
}

const leapDates = ['1992-02-29', '1996-02-29', '2000-02-29', '2004-02-29', '2008-02-29', '2012-02-29', '2016-02-29', '2020-02-29', '2024-02-29', '2000-02-28', '2000-03-01', '2024-03-01'];
for (let index = 0; index < leapDates.length; index += 1) {
  add(specs, 'leap-year', chartInput(ZONES[index % 3], modes[index % modes.length], leapDates[index], [0, 5, 10].includes(index) ? '23:30' : '12:00', index), []);
}
for (let index = 0; index < QUOTAS['decade-sample']; index += 1) {
  const year = 1989 + index;
  const month = String((index * 5) % 12 + 1).padStart(2, '0');
  const day = String((index * 7) % 27 + 1).padStart(2, '0');
  const mode = [0, 5, 10].includes(index) ? 'date-only' : modes[index % modes.length];
  add(specs, 'decade-sample', chartInput(ZONES[index % 3], mode, `${year}-${month}-${day}`, '14:37', index), []);
}

if (specs.length !== 240) throw new Error(`Expected 240 positive fixture specifications, got ${specs.length}`);
const inputKeys = new Set(specs.map((spec) => JSON.stringify(spec.input)));
if (inputKeys.size !== specs.length) throw new Error(`Fixture inputs must be unique: ${inputKeys.size}/${specs.length}`);
const dayHourRecordIds = new Set(dayHour.hourBoundaryRecords.map((record) => record.id));
const timezoneReferenceIds = new Set(timezoneReference.fixtures.map((fixture) => fixture.id));
for (const spec of [...specs, ...negativeSpecs]) {
  for (const id of spec.evidenceRecordIds) {
    if (id.startsWith('hour-') && !dayHourRecordIds.has(id)) throw new Error(`Missing exact day/hour record ID ${id}`);
    if ((id.startsWith('new-york-') || id.startsWith('los-angeles-')) && !timezoneReferenceIds.has(id)) {
      throw new Error(`Missing exact IANA reference fixture ID ${id}`);
    }
  }
}

function tagsFor(spec) {
  const tags = [`zone:${spec.input.timeZone}`, `temporal:${spec.input.temporalSupport}`];
  const localDate = spec.input.localDate ?? spec.input.window?.startLocalDateTime.slice(0, 10) ?? spec.input.windows?.[0]?.startLocalDateTime.slice(0, 10);
  const localTime = spec.input.localTime ?? spec.input.window?.startLocalDateTime.slice(11) ?? spec.input.windows?.[0]?.startLocalDateTime.slice(11);
  if (localDate?.endsWith('-02-29')) tags.push('gregorian-leap-day');
  if (localDate?.startsWith('1989-') || localDate?.startsWith('2024-')) tags.push('supported-range-edge-year');
  if (localDate?.endsWith('-02-29') || localDate?.startsWith('1989-') || localDate?.startsWith('2024-')) tags.push('leap-or-range');
  if (localTime?.startsWith('23:')) tags.push('late-jasi-methodology-dispute');
  if (localTime === '00:00' || localTime === '23:59') tags.push('civil-day-edge');
  if (spec.primaryCategory.includes('dst')) tags.push('iana-transition-or-rule-era');
  if (spec.evidenceRecordIds.some((id) => overSixtyIds.has(id))) tags.push('solar-reference-delta-over-60-seconds');
  const solarStateId = spec.evidenceRecordIds.find((id) => /^jie-\d{4}-\d{2}-.+-(before|at|after)_primary_boundary$/.test(id));
  if (solarStateId) tags.push(`solar-state:${solarStateId.match(/-(before|at|after)_primary_boundary$/)?.[1]}`);
  return tags.sort();
}

const fixtures = specs.map((spec, index) => {
  const sourceChart = inyeonSajuAdapter.calculateChart(spec.input);
  const overlapTags = tagsFor(spec);
  const dispute = overlapTags.includes('late-jasi-methodology-dispute')
    ? { status: 'open', topic: 'midnight-versus-late-Jasi day transition', disposition: 'isolated; no production methodology authority asserted' }
    : overlapTags.includes('solar-reference-delta-over-60-seconds')
      ? { status: 'open', topic: 'primary solar-term minute differs from independent apparent-Sun crossing by 61-72 seconds', disposition: 'preserved; no boundary substitution or production authority asserted' }
    : { status: 'none', topic: null, disposition: 'no fixture-specific disagreement recorded' };
  const common = {
    id: `golden-${String(index + 1).padStart(3, '0')}`,
    primaryCategory: spec.primaryCategory,
    overlapTags,
    input: spec.input,
    provenance: {
      fixtureKind: 'synthetic-reference-case',
      evidenceRefs: [
        { artifactId: 'issue-12-day-hour-uncertainty-v1', sha256: SOURCE_HASHES.dayHour, recordIds: spec.evidenceRecordIds.filter((id) => id.startsWith('hour-')) },
        { artifactId: 'issue-11-year-month-differential-v1', sha256: SOURCE_HASHES.yearMonth, recordIds: spec.evidenceRecordIds.filter((id) => /^jie-\d{4}-\d{2}-.+-(before|at|after)_primary_boundary$/.test(id)) },
        { artifactId: 'issue-10-solar-term-boundaries-v1', sha256: SOURCE_HASHES.solarTerm, recordIds: spec.evidenceRecordIds.filter((id) => /^jie-\d{4}-\d{2}$/.test(id)) },
        { artifactId: 'issue-9-iana-zic-2026c-v1', sha256: SOURCE_HASHES.timezoneReference, recordIds: spec.evidenceRecordIds.filter((id) => id.includes('new-york') || id.includes('los-angeles')) },
      ],
      propertyLevelIndependence: {
        timezoneNormalization: {
          grade: spec.evidenceRecordIds.some((id) => id.startsWith('new-york-') || id.startsWith('los-angeles-')) ? 'E4' : 'E3',
          claim: 'Official IANA tzcode/tzdata validates local-civil-to-instant candidates only; E4 is reserved for an attached exact reference-fixture ID.',
        },
        solarTermLocation: spec.primaryCategory === 'solar-term-boundary'
          ? { grade: overlapTags.includes('solar-reference-delta-over-60-seconds') ? 'D' : 'E3', claim: 'Astronomy Engine independently locates apparent-Sun longitude crossing only; it does not validate a full chart.' }
          : { grade: 'E0', claim: 'No fixture-specific solar-boundary reference assertion.' },
        dayHourMapping: { grade: overlapTags.includes('late-jasi-methodology-dispute') ? 'D' : 'E2', claim: 'lunar-javascript is a separate implementation comparison; 23:00 convention disagreement remains explicit and it is not methodology authority.' },
        fullChartOutput: { grade: 'E1', claim: 'Generated from the pinned INYEON candidate implementation; regression snapshot only, with no independent or expert full-output validation.' },
        derivedFeatureOutput: { grade: 'E1', claim: 'Generated from the pinned deterministic INYEON feature package and checked canonical symbol tables; no independent full-output validation.' },
      },
      advisorReview: { status: 'not-performed', reference: null },
    },
    referenceObservations: [
      { property: 'timezoneNormalization', grade: spec.evidenceRecordIds.some((id) => id.startsWith('new-york-') || id.startsWith('los-angeles-')) ? 'E4' : 'E3', evidenceRef: 'issue-9-iana-zic-2026c-v1' },
      ...(spec.primaryCategory === 'solar-term-boundary'
        ? [{ property: 'solarTermLocation', grade: overlapTags.includes('solar-reference-delta-over-60-seconds') ? 'D' : 'E3', evidenceRef: spec.evidenceRecordIds[0] }]
        : []),
      { property: 'dayHourMapping', grade: overlapTags.includes('late-jasi-methodology-dispute') ? 'D' : 'E2', evidenceRef: 'issue-12-day-hour-uncertainty-v1' },
    ],
    adjudication: { status: 'pending', approvedExpectationRef: null },
    validationStatus: 'generated-regression-snapshot',
    methodologyDisposition: dispute.status === 'open' ? 'candidate-disputed-isolated' : 'candidate-unreviewed',
    dispute,
  };
  if (sourceChart.status === 'error') throw new Error(`Positive fixture ${common.id} unexpectedly failed: ${sourceChart.error.code}`);
  const derivedFeatures = deriveChartFeatures(sourceChart);
  if (derivedFeatures.status !== 'ok') throw new Error(`Derived feature failure for ${common.id}`);
  return { ...common, approvalRef: null, candidateObserved: { sourceChart, derivedFeatures } };
});

const negativeCapabilityFixtures = negativeSpecs.map((spec, index) => {
  const sourceChart = inyeonSajuAdapter.calculateChart(spec.input);
  if (sourceChart.status !== 'error') throw new Error(`Negative fixture ${index + 1} unexpectedly succeeded`);
  return {
    id: `negative-${String(index + 1).padStart(3, '0')}`,
    capability: spec.capability,
    input: spec.input,
    validationStatus: 'generated-negative-capability-regression',
    evidenceRefs: [{ artifactId: 'issue-9-iana-zic-2026c-v1', sha256: SOURCE_HASHES.timezoneReference, recordIds: spec.evidenceRecordIds }],
    candidateObserved: sourceChart,
  };
});

function countBy(values) {
  return Object.fromEntries([...new Set(values)].sort().map((value) => [value, values.filter((candidate) => candidate === value).length]));
}

function decadeFor(fixture) {
  const localDate = fixture.input.localDate ?? fixture.input.window?.startLocalDateTime.slice(0, 10)
    ?? fixture.input.windows?.[0]?.startLocalDateTime.slice(0, 10);
  return `${Math.floor(Number(localDate.slice(0, 4)) / 10) * 10}s`;
}

const visibleStems = new Set();
const visibleBranches = new Set();
const visibleDays = new Set();
for (const fixture of fixtures) {
  for (const variant of fixture.candidateObserved.sourceChart.variants) {
    for (const pillar of Object.values(variant.pillars)) {
      visibleStems.add(pillar.stem);
      visibleBranches.add(pillar.branch);
    }
    visibleDays.add(`${variant.pillars.day.stem}${variant.pillars.day.branch}`);
  }
}
const corpus = {
  schemaVersion: 1,
  corpusVersion: 'golden-chart-corpus-v1',
  generatedAt: '2026-09-14',
  profileVersion: 'korean-saju-v1',
  adapterVersion: '0.4.0',
  derivedFeatureVersion: 'korean-saju-derived-v1',
  validationStatus: 'candidate-regression-corpus',
  productionValidated: false,
  productionEligible: false,
  truthClaim: 'candidateObserved full charts and derived features are deterministic regression snapshots of pinned candidate code, not approvedExpected, independent, expert, KASI, or production methodology truth.',
  approvedExpectedSource: { path: 'golden-chart-approvals.v1.json', generatorWritesThisFile: false },
  evidenceGradeScale: {
    E0: 'unsupported assertion', E1: 'single implementation observation', E2: 'separate implementation comparison',
    E3: 'independent or official-source-derived reference for a bounded property without an exact fixture match', E4: 'official or expert authority attached to the exact bounded property and fixture',
    D: 'known disagreement; production disposition unresolved',
  },
  methodology: {
    dayBoundary: 'local-civil-midnight',
    hourBranchConvention: 'local-civil-two-hour-intervals-from-23:00',
    trueSolarTime: false,
    unresolved: ['midnight-versus-late-Jasi day transition', 'Korean-methodology expert review', 'KASI-aligned production validation'],
  },
  sourceArtifacts: {
    dayHourEvidence: { path: '../../saju-adapter/data/day-hour-evidence.v1.json', sha256: SOURCE_HASHES.dayHour, recordCollection: 'hourBoundaryRecords/fullRangeDifferential' },
    yearMonthDifferential: { path: '../../saju-adapter/data/year-month-differential.v1.json', sha256: SOURCE_HASHES.yearMonth, recordCollection: 'boundaryRecords' },
    solarTermBoundaries: { path: '../../saju-adapter/data/solar-term-boundaries.v1.json', sha256: SOURCE_HASHES.solarTerm, recordCollection: 'records' },
    timezoneReferenceFixtures: { path: '../../timezone-resolver/data/iana-reference-fixtures.v1.json', sha256: SOURCE_HASHES.timezoneReference, recordCollection: 'fixtures' },
    timezoneData: { path: '../../timezone-resolver/data/iana-2026c-filtered.json', sha256: SOURCE_HASHES.timezoneData },
  },
  coveragePolicy: { primaryCategoriesAreMutuallyExclusive: true, overlapTagsAreNonExclusive: true, quotas: QUOTAS },
  coverage: {
    positiveFixtureCount: fixtures.length,
    negativeCapabilityFixtureCount: negativeCapabilityFixtures.length,
    primaryCategories: countBy(fixtures.map((fixture) => fixture.primaryCategory)),
    timeZones: countBy(fixtures.map((fixture) => fixture.input.timeZone)),
    temporalSupport: countBy(fixtures.map((fixture) => fixture.input.temporalSupport)),
    supportedDecades: countBy(fixtures.map(decadeFor)),
    disputeCount: fixtures.filter((fixture) => fixture.dispute.status === 'open').length,
    overlapTags: countBy(fixtures.flatMap((fixture) => fixture.overlapTags)),
    visibleHeavenlyStemsHangul: [...visibleStems].sort(),
    visibleEarthlyBranchesHangul: [...visibleBranches].sort(),
    visibleDayPillarsHangul: [...visibleDays].sort(),
  },
  fixtures,
  negativeCapabilityFixtures,
};

const serialized = `${JSON.stringify(corpus, null, 2)}\n`;
if (check) {
  const committed = readFileSync(outputPath, 'utf8');
  if (committed !== serialized) throw new Error('golden-chart-corpus.v1.json is stale; regenerate it without --check');
} else {
  writeFileSync(outputPath, serialized);
}
