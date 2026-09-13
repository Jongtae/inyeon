import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const canonicalPath = fileURLToPath(new URL('../source/wikidata-public-figures.v1.json', import.meta.url));
const candidatePath = fileURLToPath(new URL('../source/wikidata-public-figures.candidate.json', import.meta.url));
const reviewPath = fileURLToPath(new URL('../source/wikidata-public-figures.candidate-review.json', import.meta.url));
const endpoint = 'https://query.wikidata.org/sparql';
const entityEndpoint = 'https://www.wikidata.org/w/api.php';
const retrievedAtFlag = process.argv.indexOf('--retrieved-at');
const retrievedAt = retrievedAtFlag >= 0 ? process.argv[retrievedAtFlag + 1] : null;
if (!retrievedAt || !/^\d{4}-\d{2}-\d{2}$/u.test(retrievedAt)) {
  throw new Error('Pass a fixed retrieval date: --retrieved-at YYYY-MM-DD');
}

const categories = [
  { id: 'actor', occupations: ['wd:Q33999'] },
  { id: 'music', occupations: ['wd:Q177220', 'wd:Q639669', 'wd:Q2252262'] },
  { id: 'sports', occupations: ['wd:Q937857', 'wd:Q3665646', 'wd:Q10833314', 'wd:Q2066131'] },
  { id: 'creator', occupations: ['wd:Q49757', 'wd:Q2526255', 'wd:Q17125263'] },
];
const ranges = [
  { id: '1950-1988', start: '1950-01-01', end: '1989-01-01', limit: 120 },
  { id: '1989-2006', start: '1989-01-01', end: '2007-01-01', limit: 120 },
];
const queries = [];

function queryText(category, range) {
  const occupations = category.occupations.join(' ');
  return `SELECT DISTINCT ?person ?birthDate ?sitelinks ?article WHERE {
  VALUES ?occupation { ${occupations} }
  ?person wdt:P31 wd:Q5; wdt:P106 ?occupation; wdt:P569 ?birthDate; wikibase:sitelinks ?sitelinks.
  ?article schema:about ?person; schema:isPartOf <https://en.wikipedia.org/>.
  FILTER(?birthDate >= "${range.start}T00:00:00Z"^^xsd:dateTime)
  FILTER(?birthDate < "${range.end}T00:00:00Z"^^xsd:dateTime)
  FILTER(?sitelinks >= 20)
} ORDER BY DESC(?sitelinks) ?person LIMIT ${range.limit}`;
}

async function fetchJson(url, options = {}, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'User-Agent': 'INYEON/0.1 (https://github.com/Jongtae/inyeon)', ...options.headers },
        signal: AbortSignal.timeout(90_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
    }
  }
  throw lastError;
}

function value(binding, key) {
  return binding[key]?.value ?? null;
}

const pools = new Map(categories.map(({ id }) => [id, new Map()]));
for (const category of categories) {
  for (const range of ranges) {
    const sparql = queryText(category, range);
    const url = `${endpoint}?query=${encodeURIComponent(sparql)}&format=json`;
    console.log(`Fetching ${category.id}/${range.id} candidate QIDs`);
    const payload = await fetchJson(url, { headers: { Accept: 'application/sparql-results+json' } });
    queries.push({ id: `${category.id}-${range.id}`, category: category.id, range, sparql, resultRowCount: payload.results.bindings.length });
    for (const binding of payload.results.bindings) {
      const qid = value(binding, 'person')?.split('/').pop();
      if (!/^Q\d+$/u.test(qid ?? '')) continue;
      const pool = pools.get(category.id);
      const existing = pool.get(qid) ?? {
        qid,
        displayName: null,
        aliases: [],
        category: category.id,
        queryBirthDates: [],
        birthDates: [],
        birthPlaces: [],
        countries: [],
        sitelinks: Number(value(binding, 'sitelinks')),
        englishArticleUrl: value(binding, 'article'),
      };
      const queryDate = value(binding, 'birthDate');
      if (queryDate && !existing.queryBirthDates.includes(queryDate)) existing.queryBirthDates.push(queryDate);
      pool.set(qid, existing);
    }
  }
}

const selected = [];
const selectedQids = new Set();
for (const category of categories) {
  const values = [...pools.get(category.id).values()]
    .sort((left, right) => right.sitelinks - left.sitelinks || Number(left.qid.slice(1)) - Number(right.qid.slice(1)));
  const recent = values.filter(({ queryBirthDates }) => queryBirthDates.some((date) => date >= '1989-01-01')).slice(0, 35);
  const candidates = [...recent, ...values];
  const categorySelection = [];
  for (const record of candidates) {
    if (selectedQids.has(record.qid) || categorySelection.some(({ qid }) => qid === record.qid)) continue;
    categorySelection.push(record);
    if (categorySelection.length === 150) break;
  }
  if (categorySelection.length < 150) throw new Error(`Only ${categorySelection.length} unique ${category.id} records qualified`);
  for (const record of categorySelection) {
    selectedQids.add(record.qid);
    selected.push(record);
  }
}

for (let offset = 0; offset < selected.length; offset += 20) {
  const batch = selected.slice(offset, offset + 20);
  const params = new URLSearchParams({
    action: 'wbgetentities', format: 'json', formatversion: '2',
    ids: batch.map(({ qid }) => qid).join('|'), props: 'info|labels|aliases|claims|sitelinks',
    languages: 'en', languagefallback: '1', origin: '*',
  });
  const payload = await fetchJson(`${entityEndpoint}?${params.toString()}`);
  for (const record of batch) {
    const entity = payload.entities[record.qid];
    if (!entity || entity.missing) throw new Error(`Missing entity metadata for ${record.qid}`);
    record.revisionId = entity.lastrevid;
    record.displayName = entity.labels?.en?.value ?? null;
    record.aliases = (entity.aliases?.en ?? []).map(({ value: alias }) => alias).filter((alias) => alias !== record.displayName).slice(0, 12);
    record.englishArticleUrl = entity.sitelinks?.enwiki?.url ?? record.englishArticleUrl;
    record.birthDates = (entity.claims?.P569 ?? [])
      .filter(({ rank, mainsnak }) => rank !== 'deprecated' && mainsnak?.snaktype === 'value')
      .map(({ id, mainsnak }) => ({
        value: mainsnak.datavalue?.value?.time?.replace(/^\+/u, '') ?? null,
        statementUri: `http://www.wikidata.org/entity/statement/${id}`,
        precision: mainsnak.datavalue?.value?.precision ?? null,
      }));
    record.birthPlaces = (entity.claims?.P19 ?? [])
      .filter(({ rank, mainsnak }) => rank !== 'deprecated' && mainsnak?.snaktype === 'value')
      .map(({ mainsnak }) => ({ qid: mainsnak.datavalue?.value?.id ?? null, label: null }));
    record.countries = (entity.claims?.P27 ?? [])
      .filter(({ rank, mainsnak }) => rank !== 'deprecated' && mainsnak?.snaktype === 'value')
      .map(({ mainsnak }) => ({ qid: mainsnak.datavalue?.value?.id ?? null, label: null }));
  }
}

const referenceQids = [...new Set(selected.flatMap((record) => [
  ...record.birthPlaces.map(({ qid }) => qid), ...record.countries.map(({ qid }) => qid),
]).filter((qid) => /^Q\d+$/u.test(qid)))];
const referenceLabels = new Map();
for (let offset = 0; offset < referenceQids.length; offset += 50) {
  const qids = referenceQids.slice(offset, offset + 50);
  const params = new URLSearchParams({
    action: 'wbgetentities', format: 'json', formatversion: '2', ids: qids.join('|'),
    props: 'labels', languages: 'en', languagefallback: '1', origin: '*',
  });
  const payload = await fetchJson(`${entityEndpoint}?${params.toString()}`);
  for (const qid of qids) referenceLabels.set(qid, payload.entities[qid]?.labels?.en?.value ?? qid);
}

for (const record of selected) {
  delete record.queryBirthDates;
  record.birthDates = record.birthDates.filter(({ value: date }) => typeof date === 'string');
  record.birthPlaces = record.birthPlaces.filter(({ qid }) => /^Q\d+$/u.test(qid))
    .map(({ qid }) => ({ qid, label: referenceLabels.get(qid) }));
  record.countries = record.countries.filter(({ qid }) => /^Q\d+$/u.test(qid))
    .map(({ qid }) => ({ qid, label: referenceLabels.get(qid) }));
  record.birthDates.sort((left, right) => `${left.value}|${left.statementUri}`.localeCompare(`${right.value}|${right.statementUri}`, 'en'));
  record.birthPlaces.sort((left, right) => left.qid.localeCompare(right.qid, 'en'));
  record.countries.sort((left, right) => left.qid.localeCompare(right.qid, 'en'));
  record.aliases = [...new Set(record.aliases)].sort((left, right) => left.localeCompare(right, 'en'));
  record.sourceEntityUrl = `https://www.wikidata.org/wiki/${record.qid}`;
}
selected.sort((left, right) => left.category.localeCompare(right.category, 'en') || Number(left.qid.slice(1)) - Number(right.qid.slice(1)));

const snapshot = {
  schemaVersion: 1,
  sourceSnapshotVersion: 'wikidata-public-figures-v1',
  retrievedAt,
  source: {
    name: 'Wikidata',
    endpoint,
    entityEndpoint,
    license: 'CC0-1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    accuracyBoundary: 'Wikidata is a structured source snapshot, not an infallible or independent truth authority.',
  },
  selectionPolicy: {
    corpusSize: 600,
    perCategory: 150,
    categories: categories.map(({ id, occupations }) => ({ id, occupations })),
    englishWikipediaArticleRequired: true,
    minimumWikimediaSitelinks: 20,
    atLeastRecentPerCategory: 35,
    dateRanges: ranges,
    representativenessClaim: false,
  },
  queries,
  records: selected,
};
const baseline = existsSync(canonicalPath) ? JSON.parse(readFileSync(canonicalPath, 'utf8')) : { records: [] };
const baselineByQid = new Map(baseline.records.map((record) => [record.qid, record]));
const candidateByQid = new Map(selected.map((record) => [record.qid, record]));
const addedQids = selected.filter(({ qid }) => !baselineByQid.has(qid)).map(({ qid }) => qid).sort();
const removedQids = baseline.records.filter(({ qid }) => !candidateByQid.has(qid)).map(({ qid }) => qid).sort();
const changedRecords = selected.flatMap((record) => {
  const previous = baselineByQid.get(record.qid);
  if (!previous) return [];
  const fields = [...new Set([...Object.keys(previous), ...Object.keys(record)])]
    .filter((key) => JSON.stringify(previous[key]) !== JSON.stringify(record[key])).sort();
  return fields.length === 0 ? [] : [{ qid: record.qid, changedFields: fields }];
});
const review = {
  schemaVersion: 1,
  reviewVersion: 'wikidata-public-figure-refresh-review-v1',
  baselineRetrievedAt: baseline.retrievedAt ?? null,
  candidateRetrievedAt: retrievedAt,
  candidateSha256: createHash('sha256').update(`${JSON.stringify(snapshot, null, 2)}\n`).digest('hex'),
  addedQids,
  removedQids,
  changedRecords,
  unchangedCount: selected.length - addedQids.length - changedRecords.length,
  requiresReview: addedQids.length > 0 || removedQids.length > 0 || changedRecords.length > 0,
};
writeFileSync(candidatePath, `${JSON.stringify(snapshot, null, 2)}\n`);
writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);
console.log(`Wrote ${selected.length} candidate source records and a review report; canonical source was not changed`);
