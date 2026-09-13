import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { SearchSunLongitude } from 'astronomy-engine';
import lunar from 'lunar-javascript';
import { calculateFourPillars, getSolarTermsOfYear } from 'manseryeok';

const gan = Object.fromEntries([...'甲乙丙丁戊己庚辛壬癸'].map((value, index) => [value, ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][index]]));
const zhi = Object.fromEntries([...'子丑寅卯辰巳午未申酉戌亥'].map((value, index) => [value, ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'][index]]));
const toHangul = (value) => `${gan[value[0]]}${zhi[value[1]]}`;
const fixtureProvenance = {
  profileVersion: 'korean-saju-v1',
  adapterVersion: '0.4.0',
  upstreamVersion: '2.0.0',
  timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1',
  referenceDataVersion: 'issue-10-solar-term-boundaries-v1',
  solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1',
  solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1',
  solarTermPrecision: 'minute',
  derivedFeatureVersion: 'not-applicable',
};
const isoKst = (date) => {
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
};

function inputFromIsoKst(value) {
  return {
    localDate: value.slice(0, 10),
    localTime: value.slice(11, 16),
    timePrecision: 'exact',
    calendarKind: 'solar',
    timeZone: 'Asia/Seoul',
    ambiguity: 'unambiguous',
    profileVersion: 'korean-saju-v1',
    timezoneDataVersion: 'fixed-kst-utc-plus-09-1989-2024-v1',
    referenceDataVersion: 'issue-10-solar-term-boundaries-v1',
  };
}

function outputs(input) {
  const [year, month, day] = input.localDate.split('-').map(Number);
  const [hour, minute] = input.localTime.split(':').map(Number);
  const primary = calculateFourPillars({ year, month, day, hour, minute, dayBoundary: 'midnight' }).toObject();
  const lunarValue = lunar.Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  const comparison = {
    year: toHangul(lunarValue.getYearInGanZhiExact()),
    month: toHangul(lunarValue.getMonthInGanZhiExact()),
    day: toHangul(lunarValue.getDayInGanZhiExact()),
    hour: toHangul(lunarValue.getTimeInGanZhi()),
  };
  const differing = Object.keys(primary).filter((key) => primary[key] !== comparison[key]);
  return { primary, comparison, differing };
}

function classifyFindings(input, result) {
  return result.differing.map((pillar) => {
    const knownBoundaryConventionDifference = input.localTime.startsWith('23:') && (pillar === 'day' || pillar === 'hour');
    const category = knownBoundaryConventionDifference
      ? 'methodology_difference'
      : 'source_reference_inconsistency';
    return {
      pillar,
      category,
      primaryOutput: result.primary[pillar],
      comparisonOutput: result.comparison[pillar],
      evidence: category === 'methodology_difference'
        ? 'The configured primary midnight rule and the explicit lunar getDayInGanZhiExact/getTimeInGanZhi getters exhibit different 23:xx day/hour behavior; this does not decide which convention is correct.'
        : 'The implementations place a solar-term boundary at different precision/instants; neither is treated as an oracle.',
      disposition: category === 'methodology_difference' ? 'recorded-in-issue-12-day-hour-corpus' : 'recorded-in-issue-10-boundary-corpus',
    };
  });
}

function summarize(findings) {
  const categories = [...new Set(findings.map((finding) => finding.category))];
  if (categories.length === 0) return 'agreement';
  return categories.length === 1 ? categories[0] : 'multiple_classified_differences';
}

const records = [];
const terms = getSolarTermsOfYear(2024).filter((term) => term.index % 2 === 0);
for (const term of terms) {
  const longitude = (285 + term.index * 15) % 360;
  const astronomy = SearchSunLongitude(longitude, new Date(term.date.getTime() - 10 * 24 * 60 * 60 * 1000), 30);
  if (!astronomy) throw new Error(`No astronomy boundary for ${term.name}`);
  const boundaryDeltaSeconds = Math.round(Math.abs(term.date.getTime() - astronomy.date.getTime()) / 1000);
  if (boundaryDeltaSeconds > 300) throw new Error(`Independent boundary delta exceeds five minutes for ${term.name}: ${boundaryDeltaSeconds}s`);
  for (const [side, offset] of [['before', -60_000], ['after', 60_000]]) {
    const input = inputFromIsoKst(isoKst(new Date(term.date.getTime() + offset)));
    const result = outputs(input);
    const findings = classifyFindings(input, result);
    records.push({
      id: `term-2024-${String(term.index).padStart(2, '0')}-${side}`,
      input,
      provenance: fixtureProvenance,
      primary: { engine: 'manseryeok', version: '2.0.0', apiMode: { dayBoundary: 'midnight' }, output: result.primary },
      comparison: { engine: 'lunar-javascript', version: '1.7.7', apiMode: { year: 'getYearInGanZhiExact', month: 'getMonthInGanZhiExact', day: 'getDayInGanZhiExact', hour: 'getTimeInGanZhi', observedLateZiSemantics: '23:00 begins its next-day day/hour-stem convention' }, output: result.comparison },
      independentReference: {
        engine: 'astronomy-engine', version: '2.1.19', assertedProperty: 'apparent-sun-longitude boundary location',
        independentForAssertedProperty: true, longitudeDegrees: longitude,
        primaryBoundaryUtc: term.date.toISOString(), comparisonBoundaryUtc: astronomy.date.toISOString(),
        absoluteDifferenceSeconds: boundaryDeltaSeconds,
      },
      classification: summarize(findings),
      differingPillars: result.differing,
      findings,
      evidenceSourceCategory: 'independent_ephemeris_boundary_locator_and_shared_lineage_chart_comparison',
      notes: 'Astronomy Engine independently locates the longitude crossing only. Lunar chart agreement is not independent methodology evidence.',
    });
  }
}

const dates = ['1996-02-28', '1996-02-29', '1999-12-31', '2000-02-28', '2000-02-29', '2000-03-01', '2023-12-31', '2024-02-28', '2024-02-29', '2024-03-01'];
for (const date of dates) {
  for (const time of ['23:59', '00:00']) {
    const input = inputFromIsoKst(`${date}T${time}`);
    const result = outputs(input);
    const findings = classifyFindings(input, result);
    records.push({
      id: `day-${date}-${time.replace(':', '')}`,
      input,
      provenance: fixtureProvenance,
      primary: { engine: 'manseryeok', version: '2.0.0', apiMode: { dayBoundary: 'midnight' }, output: result.primary },
      comparison: { engine: 'lunar-javascript', version: '1.7.7', apiMode: { year: 'getYearInGanZhiExact', month: 'getMonthInGanZhiExact', day: 'getDayInGanZhiExact', hour: 'getTimeInGanZhi', observedLateZiSemantics: '23:00 begins its next-day day/hour-stem convention' }, output: result.comparison },
      independentReference: { assertedProperty: 'none', independentForAssertedProperty: false },
      classification: summarize(findings),
      differingPillars: result.differing,
      findings,
      evidenceSourceCategory: date.includes('02-') ? 'leap_and_civil_day_boundary_shared_lineage_comparison' : 'civil_day_boundary_shared_lineage_comparison',
      notes: time.startsWith('23:') ? 'The configured midnight mode and explicit lunar day/time getters are known to differ at 23:xx; the Issue #12 evidence preserves that difference without choosing a correct convention.' : 'Comparison implementation is not treated as an oracle.',
    });
  }
}

for (const hour of [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]) {
  for (const minute of [0, 59]) {
    const effectiveHour = minute === 59 ? hour - 1 : hour;
    const input = inputFromIsoKst(`2024-06-15T${String(effectiveHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    const result = outputs(input);
    const findings = classifyFindings(input, result);
    records.push({
      id: `hour-2024-06-15-${input.localTime.replace(':', '')}`,
      input,
      provenance: fixtureProvenance,
      primary: { engine: 'manseryeok', version: '2.0.0', apiMode: { dayBoundary: 'midnight' }, output: result.primary },
      comparison: { engine: 'lunar-javascript', version: '1.7.7', apiMode: { year: 'getYearInGanZhiExact', month: 'getMonthInGanZhiExact', day: 'getDayInGanZhiExact', hour: 'getTimeInGanZhi', observedLateZiSemantics: '23:00 begins its next-day day/hour-stem convention' }, output: result.comparison },
      independentReference: { assertedProperty: 'none', independentForAssertedProperty: false },
      classification: summarize(findings),
      differingPillars: result.differing,
      findings,
      evidenceSourceCategory: 'civil_hour_boundary_shared_lineage_comparison',
      notes: 'Exercises the civil two-hour branch interval; comparison is not independent methodology evidence.',
    });
  }
}

const negativeCases = [
  ['negative-timezone', { ...inputFromIsoKst('2024-01-01T12:00'), timeZone: 'America/New_York' }, 'TIMEZONE_UNSUPPORTED'],
  ['negative-date-nonleap', { ...inputFromIsoKst('2023-02-29T12:00') }, 'DATE_INVALID'],
  ['negative-date-format', { ...inputFromIsoKst('2024-01-01T12:00'), localDate: '2024-1-1' }, 'DATE_INVALID'],
  ['negative-time-2400', { ...inputFromIsoKst('2024-01-01T12:00'), localTime: '24:00' }, 'TIME_INVALID'],
  ['negative-ambiguous', { ...inputFromIsoKst('2024-01-01T12:00'), ambiguity: 'ambiguous' }, 'AMBIGUOUS_LOCAL_TIME'],
  ['negative-approximate', { ...inputFromIsoKst('2024-01-01T12:00'), timePrecision: 'approximate' }, 'TIME_PRECISION_UNSUPPORTED'],
  ['negative-unknown', { ...inputFromIsoKst('2024-01-01T12:00'), localTime: null, timePrecision: 'unknown' }, 'BIRTH_TIME_UNKNOWN'],
  ['negative-range', { ...inputFromIsoKst('1799-12-31T12:00') }, 'DATE_OUT_OF_RANGE'],
  ['negative-historical-kst', { ...inputFromIsoKst('1988-12-31T23:59') }, 'DATE_OUT_OF_RANGE'],
  ['negative-future-unvalidated', { ...inputFromIsoKst('2025-01-01T00:00') }, 'DATE_OUT_OF_RANGE'],
];
for (const [id, input, expected] of negativeCases) records.push({
  id, input,
  provenance: fixtureProvenance,
  primary: { engine: 'inyeon-adapter-validation', version: '0.4.0', output: null },
  comparison: { engine: 'not-applicable', version: null, output: null },
  independentReference: { assertedProperty: 'adapter input contract', independentForAssertedProperty: false },
  classification: 'adapter_rejection_expected', expected,
  findings: [],
  evidenceSourceCategory: 'adapter_contract_negative_case',
  notes: 'No calendrical provenance is claimed for contract validation.',
});

const corpus = {
  schemaVersion: 1,
  generatedAt: '2026-09-14',
  profileVersion: 'korean-saju-v1',
  adapterVersion: '0.4.0',
  referenceDataVersion: 'issue-10-solar-term-boundaries-v1',
  solarTermDataVersion: 'manseryeok-2.0.0-embedded-solar-terms-v1',
  solarTermReferenceVersion: 'issue-10-astronomy-engine-2.1.19-v1',
  solarTermPrecision: 'minute',
  profileStatus: 'candidate',
  productionEligible: false,
  limitations: [
    'No KASI provenance is asserted.',
    'No Korean-methodology expert review is asserted.',
    'lunar-javascript is a separate implementation for the compared day/hour mapping but is not an independent Korean-methodology authority.',
    'Astronomy Engine is independent only for apparent-Sun longitude boundary location.',
    'Issue #9 timezone normalization is integrated only through Issue #11 year/month calculation; it does not expand this corpus\'s complete-chart capability.',
    'Day/hour convention differences are preserved by the Issue #12 evidence corpus; neither corpus selects a correct Korean methodology.',
  ],
  recordCount: records.length,
  records,
};
const target = fileURLToPath(new URL('../data/differential-corpus.v1.json', import.meta.url));
const serialized = `${JSON.stringify(corpus, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const committed = await readFile(target, 'utf8').catch(() => '');
  if (committed !== serialized) throw new Error('differential-corpus.v1.json is stale; regenerate it without --check');
} else {
  await writeFile(target, serialized);
}
