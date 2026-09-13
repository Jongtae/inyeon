import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SearchSunLongitude } from 'astronomy-engine';
import { calculateFourPillars, getSolarTermsOfYear } from 'manseryeok';

const OUTPUT_URL = new URL('../data/solar-term-boundaries.v1.json', import.meta.url);
const EXPECTED_SOLAR_TERMS_DATA_SHA256 = 'fe61cc754021d012f830b03ebe06533a717e7f8a53cc30706eed65520061ddb9';
const REFERENCE_DATA_VERSION = 'issue-10-solar-term-boundaries-v1';
const SOLAR_TERM_DATA_VERSION = 'manseryeok-2.0.0-embedded-solar-terms-v1';
const SOLAR_TERM_REFERENCE_VERSION = 'issue-10-astronomy-engine-2.1.19-v1';
const GUARDRAIL_MILLISECONDS = 120_000;
const KST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000;
const JIE_INDICES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function localKst(date) {
  return `${new Date(date.getTime() + KST_OFFSET_MILLISECONDS).toISOString().slice(0, 19)}+09:00`;
}

function primaryPillarsAt(date) {
  const kst = new Date(date.getTime() + KST_OFFSET_MILLISECONDS);
  const output = calculateFourPillars({
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
    dayBoundary: 'midnight',
  }).toObject();
  return { year: output.year, month: output.month };
}

function sample(date) {
  return {
    utc: date.toISOString(),
    localKst: localKst(date),
    primaryOutputHangul: primaryPillarsAt(date),
  };
}

const manseryeokEntry = fileURLToPath(import.meta.resolve('manseryeok'));
const solarTermsDataPath = fileURLToPath(new URL('./astro/solar-terms-data.js', `file://${dirname(manseryeokEntry)}/`));
const solarTermsDataSha256 = sha256(await readFile(solarTermsDataPath));
if (solarTermsDataSha256 !== EXPECTED_SOLAR_TERMS_DATA_SHA256) {
  throw new Error(`Unexpected manseryeok embedded solar-term artifact: ${solarTermsDataSha256}`);
}

const records = [];
for (let year = 1989; year <= 2024; year += 1) {
  const terms = getSolarTermsOfYear(year).filter((term) => term.index % 2 === 0);
  if (terms.length !== 12) throw new Error(`Expected 12 절 (jie) boundaries for ${year}, received ${terms.length}`);
  if (JSON.stringify(terms.map((term) => term.index)) !== JSON.stringify(JIE_INDICES)) {
    throw new Error(`Unexpected jie indices for ${year}`);
  }
  if (!terms.every((term, index) => index === 0 || term.date > terms[index - 1].date)) {
    throw new Error(`Jie boundaries are not chronological for ${year}`);
  }
  for (const term of terms) {
    if (term.date.getUTCSeconds() !== 0 || term.date.getUTCMilliseconds() !== 0) {
      throw new Error(`Primary boundary is not minute-aligned for ${year} ${term.name}`);
    }
    const targetLongitudeDegrees = (285 + term.index * 15) % 360;
    const crossing = SearchSunLongitude(
      targetLongitudeDegrees,
      new Date(term.date.getTime() - 10 * 24 * 60 * 60 * 1000),
      30,
    );
    if (!crossing) throw new Error(`Astronomy Engine did not find ${year} ${term.name}`);

    const signedDeltaMilliseconds = term.date.getTime() - crossing.date.getTime();
    const absoluteDeltaMilliseconds = Math.abs(signedDeltaMilliseconds);
    if (absoluteDeltaMilliseconds > GUARDRAIL_MILLISECONDS) {
      throw new Error(`Candidate validation guardrail exceeded for ${year} ${term.name}: ${absoluteDeltaMilliseconds}ms`);
    }

    const before = sample(new Date(term.date.getTime() - 60_000));
    const at = sample(term.date);
    const after = sample(new Date(term.date.getTime() + 60_000));
    if (before.primaryOutputHangul.month === at.primaryOutputHangul.month) {
      throw new Error(`Primary month pillar did not change at ${year} ${term.name}`);
    }
    if (JSON.stringify(at.primaryOutputHangul) !== JSON.stringify(after.primaryOutputHangul)) {
      throw new Error(`Primary at/after outputs differ at ${year} ${term.name}`);
    }
    const yearChanged = before.primaryOutputHangul.year !== at.primaryOutputHangul.year;
    if (yearChanged !== (term.name === '입춘')) {
      throw new Error(`Unexpected year-pillar transition at ${year} ${term.name}`);
    }

    records.push({
      id: `jie-${year}-${String(term.index).padStart(2, '0')}`,
      year,
      term: {
        index: term.index,
        nameHangul: term.name,
        nameHanja: term.hanja,
        targetLongitudeDegrees,
      },
      primaryBoundary: {
        utc: term.date.toISOString(),
        localKst: localKst(term.date),
      },
      independentReference: {
        crossingUtc: crossing.date.toISOString(),
      },
      signedDeltaMilliseconds,
      absoluteDeltaMilliseconds,
      classification: absoluteDeltaMilliseconds > 60_000
        ? 'within_candidate_guardrail_over_one_minute'
        : 'within_candidate_guardrail_at_or_under_one_minute',
      samples: {
        before_primary_boundary: before,
        at_primary_boundary: at,
        after_primary_boundary: after,
      },
    });
  }
}

const maximum = records.reduce((current, record) => (
  record.absoluteDeltaMilliseconds > current.absoluteDeltaMilliseconds ? record : current
));
const artifact = {
  schemaVersion: 1,
  generatedAt: '2026-09-14',
  adapterVersion: '0.2.0',
  profileVersion: 'korean-saju-v1',
  profileStatus: 'candidate',
  productionEligible: false,
  referenceDataVersion: REFERENCE_DATA_VERSION,
  solarTermDataVersion: SOLAR_TERM_DATA_VERSION,
  solarTermReferenceVersion: SOLAR_TERM_REFERENCE_VERSION,
  solarTermPrecision: 'minute',
  supportedRange: { minimumYear: 1989, maximumYear: 2024, timeZone: 'Asia/Seoul' },
  sourceArtifacts: {
    primary: { package: 'manseryeok', version: '2.0.0', source: 'embedded-solar-term-table', precision: 'minute', path: 'dist/astro/solar-terms-data.js', sha256: solarTermsDataSha256 },
    independentReference: { package: 'astronomy-engine', version: '2.1.19', assertedProperty: 'apparent-sun-longitude crossing only' },
  },
  candidateValidationGuardrail: {
    absoluteDeltaMilliseconds: GUARDRAIL_MILLISECONDS,
    meaning: 'A fail-closed validation threshold for this bounded candidate corpus; it is not an accuracy guarantee or oracle claim.',
  },
  summary: {
    recordCount: records.length,
    yearCount: 36,
    jieBoundaryCountPerYear: 12,
    overSixtySecondsCount: records.filter((record) => record.absoluteDeltaMilliseconds > 60_000).length,
    overNinetySecondsCount: records.filter((record) => record.absoluteDeltaMilliseconds > 90_000).length,
    maximumAbsoluteDeltaMilliseconds: maximum.absoluteDeltaMilliseconds,
    maximumRecordId: maximum.id,
    maximum: {
      recordId: maximum.id,
      year: maximum.year,
      termNameHangul: maximum.term.nameHangul,
      termNameHanja: maximum.term.nameHanja,
      signedDeltaMilliseconds: maximum.signedDeltaMilliseconds,
      absoluteDeltaMilliseconds: maximum.absoluteDeltaMilliseconds,
    },
  },
  limitations: [
    'This corpus validates boundary-table behavior and independently locates apparent-Sun longitude crossings; it does not validate complete Four Pillars charts.',
    'The embedded primary table minute remains the calculation boundary; the Astronomy Engine crossing is not substituted for it.',
    'KASI provenance and Korean-methodology expert review remain pending.',
    'The 120-second guardrail is a candidate validation threshold, not an accuracy claim.',
  ],
  records,
};

const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const committed = await readFile(OUTPUT_URL, 'utf8').catch(() => '');
  if (committed !== serialized) {
    throw new Error('solar-term-boundaries.v1.json is stale; regenerate it without --check');
  }
} else {
  await writeFile(OUTPUT_URL, serialized);
}
