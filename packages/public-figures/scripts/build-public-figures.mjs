import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createRefreshReview } from './refresh-review.mjs';
import { assertPublicReferenceBoundary, validBirthFact } from './source-boundary.mjs';

const sourcePath = fileURLToPath(new URL('../source/wikidata-public-figures.v1.json', import.meta.url));
const recordsPath = fileURLToPath(new URL('../data/public-figures.v1.json', import.meta.url));
const indexPath = fileURLToPath(new URL('../data/public-figure-index.v1.json', import.meta.url));
const reportPath = fileURLToPath(new URL('../data/public-figure-quality.v1.json', import.meta.url));
const manifestPath = fileURLToPath(new URL('../data/public-figure-manifest.v1.json', import.meta.url));
const check = process.argv.includes('--check');
const forbiddenKeys = new Set(['userId', 'accountId', 'datingProfileId', 'like', 'match', 'message', 'distance', 'online', 'activity', 'inboundInterest', 'endorsement']);
const supportedZones = new Map([
  ['Q60', 'America/New_York'],
  ['Q65', 'America/Los_Angeles'],
  ['Q8684', 'Asia/Seoul'],
]);
const categories = new Set(['actor', 'music', 'sports', 'creator']);
const unsafeText = /[\p{Cc}\p{Cf}<>]/u;
const qidPattern = /^Q[1-9]\d{0,11}$/u;
const outputBudgets = { records: 2_000_000, index: 500_000, quality: 250_000 };
const rawRecordKeys = [
  'qid', 'displayName', 'aliases', 'category', 'birthDates', 'birthPlaces', 'countries', 'sitelinks',
  'englishArticleUrl', 'revisionId', 'sourceEntityUrl',
];

function stable(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function validText(value, maximum = 160) {
  return typeof value === 'string' && value.length > 0 && value.length <= maximum && !unsafeText.test(value)
    && [...value].every((character) => (character.codePointAt(0) ?? 0) >= 32);
}

function normalizeSearch(value) {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/gu, ' ');
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validEnglishArticleUrl(value) {
  if (typeof value !== 'string' || value.length > 512) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'en.wikipedia.org' && url.pathname.startsWith('/wiki/')
      && url.username === '' && url.password === '' && url.search === '' && url.hash === '';
  } catch {
    return false;
  }
}

function hasExactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function rejectForbiddenKeys(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) throw new Error(`Forbidden marketplace field: ${key}`);
    rejectForbiddenKeys(child);
  }
}

function writeOrCheck(path, content) {
  if (check) {
    if (readFileSync(path, 'utf8') !== content) throw new Error(`Generated artifact drift: ${path}`);
  } else writeFileSync(path, content);
}

const sourceBytes = readFileSync(sourcePath);
if (sourceBytes.byteLength > 12_000_000) throw new Error('Source snapshot exceeds the bounded build-input size');
const source = JSON.parse(sourceBytes.toString('utf8'));
if (source.schemaVersion !== 1 || source.sourceSnapshotVersion !== 'wikidata-public-figures-v1'
  || !validIsoDate(source.retrievedAt) || source.source?.name !== 'Wikidata'
  || source.source?.endpoint !== 'https://query.wikidata.org/sparql'
  || source.source?.entityEndpoint !== 'https://www.wikidata.org/w/api.php'
  || source.source?.license !== 'CC0-1.0'
  || source.source?.licenseUrl !== 'https://creativecommons.org/publicdomain/zero/1.0/'
  || !Array.isArray(source.records) || source.records.length !== 600) throw new Error('Invalid source snapshot header');
assertPublicReferenceBoundary(source);

const records = [];
const quarantine = [];
const ids = new Set();
for (const raw of source.records) {
  if (!hasExactKeys(raw, rawRecordKeys)) throw new Error('Invalid source record shape');
  rejectForbiddenKeys(raw);
  if (!qidPattern.test(raw.qid) || !Number.isSafeInteger(raw.revisionId) || raw.revisionId < 1
    || !validText(raw.displayName) || !categories.has(raw.category) || !Number.isSafeInteger(raw.sitelinks) || raw.sitelinks < 20
    || !Array.isArray(raw.birthDates) || !Array.isArray(raw.birthPlaces) || !Array.isArray(raw.countries)
    || raw.birthDates.length > 8 || raw.birthPlaces.length > 8 || raw.countries.length > 8
    || !Array.isArray(raw.aliases) || raw.aliases.length > 24
    || raw.sourceEntityUrl !== `https://www.wikidata.org/wiki/${raw.qid}` || raw.sourceEntityUrl.length > 64
    || !validEnglishArticleUrl(raw.englishArticleUrl)) {
    throw new Error(`Invalid source record ${raw.qid ?? 'unknown'}`);
  }
  if (raw.birthDates.some((fact) => !validBirthFact(raw.qid, fact))
    || raw.birthPlaces.some((fact) => !hasExactKeys(fact, ['qid', 'label']))
    || raw.countries.some((fact) => !hasExactKeys(fact, ['qid', 'label']))) throw new Error(`Invalid fact shape for ${raw.qid}`);
  const id = `public:wd-${raw.qid.toLowerCase()}`;
  if (ids.has(id)) throw new Error(`Duplicate public figure ID: ${id}`);
  ids.add(id);
  const aliases = [...new Set(raw.aliases.filter((alias) => validText(alias) && alias !== raw.displayName))]
    .sort((left, right) => left.localeCompare(right, 'en')).slice(0, 12);
  const regions = [...new Set(raw.countries
    .filter((country) => qidPattern.test(country.qid) && validText(country.label) && country.label !== country.qid)
    .map(({ label }) => label))].sort((left, right) => left.localeCompare(right, 'en'));
  if (regions.length === 0) {
    quarantine.push({ qid: raw.qid, reason: 'REGION_UNAVAILABLE', candidateValues: [] });
    continue;
  }
  const dates = [...new Map(raw.birthDates.map((fact) => [fact.value, fact])).values()];
  const preciseDates = dates.filter((fact) => fact.precision === 11 && /^\d{4}-\d{2}-\d{2}T00:00:00Z$/u.test(fact.value));
  if (dates.length !== 1 || preciseDates.length !== 1) {
    quarantine.push({ qid: raw.qid, reason: dates.length > 1 ? 'CONFLICTING_BIRTH_DATE' : 'BIRTH_DATE_NOT_DAY_PRECISION', candidateValues: dates.map(({ value }) => value).sort() });
    continue;
  }
  const dateFact = preciseDates[0];
  const localDate = dateFact.value.slice(0, 10);
  if (!validIsoDate(localDate)) throw new Error(`Invalid birth date for ${raw.qid}`);
  const statementId = dateFact.statementUri.split('/').pop();
  if (!statementId) throw new Error(`Invalid birth statement for ${raw.qid}`);
  const places = [...new Map(raw.birthPlaces.map((place) => [place.qid, place])).values()]
    .filter((place) => qidPattern.test(place.qid) && validText(place.label));
  const resolvedPlace = places.length === 1 ? places[0] : null;
  const reasons = [];
  if (localDate < '1989-01-01' || localDate > '2024-12-31') reasons.push('BIRTH_DATE_OUTSIDE_ADAPTER_RANGE');
  const timeZone = resolvedPlace ? supportedZones.get(resolvedPlace.qid) : null;
  if (!timeZone) reasons.push('BIRTHPLACE_TIMEZONE_UNRESOLVED');
  const sourceRef = `wikidata:${raw.qid}`;
  const chartContext = reasons.length === 0 ? {
    temporalSupport: 'date-only', localDate, timeZone, calendarKind: 'solar',
    profileVersion: 'korean-saju-v1', timezoneDataVersion: 'iana-2026c-inyeon-filter-v1',
    referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
  } : null;
  records.push({
    kind: 'public_figure', id, recordVersion: 'public-figure-record-v1', dataVersion: 'public-figures-v1',
    displayName: raw.displayName, aliases, category: raw.category,
    regions,
    birth: {
      date: { status: 'resolved', value: localDate, sourceQuality: 'single-structured-source', provenanceRefs: [`${sourceRef}#${statementId}`] },
      place: resolvedPlace
        ? { status: 'resolved', value: { sourceId: resolvedPlace.qid, label: resolvedPlace.label }, sourceQuality: 'single-structured-source', provenanceRefs: [sourceRef] }
        : { status: 'unknown', value: null, sourceQuality: 'unknown', provenanceRefs: [] },
      time: { status: 'date_only', localTime: null, candidates: [], provenanceRefs: [] },
    },
    sourceRecords: [{
      id: sourceRef, sourceType: 'structured-aggregator', publisher: 'Wikidata', title: `Wikidata entity ${raw.qid}`,
      url: raw.sourceEntityUrl, retrievedAt: source.retrievedAt, revisionId: raw.revisionId,
      license: 'CC0-1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    }],
    image: null,
    comparisonEligibility: { status: reasons.length === 0 ? 'eligible' : 'unavailable', reasons, chartContext },
  });
}
records.sort((left, right) => left.id.localeCompare(right.id, 'en'));
quarantine.sort((left, right) => left.qid.localeCompare(right.qid, 'en'));
if (records.length < 500) throw new Error(`Only ${records.length} records qualified; at least 500 are required`);
if (!records.some(({ comparisonEligibility }) => comparisonEligibility.status === 'eligible')) {
  throw new Error('At least one source record must be eligible for the pinned chart pipeline');
}

const entries = records.map((record) => ({
  kind: 'public_figure', id: record.id, displayName: record.displayName, aliases: record.aliases,
  category: record.category, regions: record.regions,
  searchTerms: [...new Set([record.displayName, ...record.aliases].map(normalizeSearch))].sort(),
  comparisonEligibility: record.comparisonEligibility.status,
}));
const countBy = (values) => Object.fromEntries([...new Set(values)].sort().map((value) => [value, values.filter((candidate) => candidate === value).length]));
const report = {
  schemaVersion: 1,
  reportVersion: 'public-figure-quality-v1',
  dataVersion: 'public-figures-v1',
  sourceSnapshotVersion: source.sourceSnapshotVersion,
  sourceRetrievedAt: source.retrievedAt,
  sourceRecordCount: source.records.length,
  publishedRecordCount: records.length,
  quarantinedRecordCount: quarantine.length,
  comparisonEligibleCount: records.filter(({ comparisonEligibility }) => comparisonEligibility.status === 'eligible').length,
  categoryCounts: countBy(records.map(({ category }) => category)),
  regionCounts: countBy(records.flatMap(({ regions }) => regions), 1),
  timeStatusCounts: { date_only: records.length },
  imageCoverage: { licensed: 0, omitted: records.length },
  sourceClassCounts: { 'single-structured-source': records.length },
  representativenessClaim: false,
  recognizabilityValidated: false,
  productionEligible: false,
  quarantine,
  refreshReview: createRefreshReview(
    [], records, quarantine.filter(({ reason }) => reason === 'CONFLICTING_BIRTH_DATE'),
  ),
};
const recordsDocument = { schemaVersion: 1, dataVersion: 'public-figures-v1', productionEligible: false, records };
const indexDocument = { schemaVersion: 1, indexVersion: 'public-figure-index-v1', dataVersion: 'public-figures-v1', entries };
const recordBytes = stable(recordsDocument);
const indexBytes = stable(indexDocument);
const reportBytes = stable(report);
if (Buffer.byteLength(recordBytes) > outputBudgets.records || Buffer.byteLength(indexBytes) > outputBudgets.index
  || Buffer.byteLength(reportBytes) > outputBudgets.quality) throw new Error('Generated public-figure artifact exceeds its static byte budget');
const manifest = {
  schemaVersion: 1,
  manifestVersion: 'public-figure-manifest-v1',
  dataVersion: 'public-figures-v1',
  productionEligible: false,
  recordCount: records.length,
  comparisonEligibleCount: report.comparisonEligibleCount,
  files: {
    source: { path: '../source/wikidata-public-figures.v1.json', sha256: sha256(sourceBytes) },
    records: { path: 'public-figures.v1.json', sha256: sha256(recordBytes) },
    index: { path: 'public-figure-index.v1.json', sha256: sha256(indexBytes) },
    quality: { path: 'public-figure-quality.v1.json', sha256: sha256(reportBytes) },
  },
};
writeOrCheck(recordsPath, recordBytes);
writeOrCheck(indexPath, indexBytes);
writeOrCheck(reportPath, reportBytes);
writeOrCheck(manifestPath, stable(manifest));
console.log(`${check ? 'Verified' : 'Built'} ${records.length} public figures (${report.comparisonEligibleCount} comparison eligible; ${quarantine.length} quarantined)`);
