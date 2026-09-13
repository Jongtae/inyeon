const qidPattern = /^Q[1-9]\d{0,11}$/u;

export const expectedSelectionPolicy = {
  corpusSize: 600,
  perCategory: 150,
  categories: [
    { id: 'actor', occupations: ['wd:Q33999'] },
    { id: 'music', occupations: ['wd:Q177220', 'wd:Q639669', 'wd:Q2252262'] },
    { id: 'sports', occupations: ['wd:Q937857', 'wd:Q3665646', 'wd:Q10833314', 'wd:Q2066131'] },
    { id: 'creator', occupations: ['wd:Q49757', 'wd:Q2526255', 'wd:Q17125263'] },
  ],
  englishWikipediaArticleRequired: true,
  minimumWikimediaSitelinks: 20,
  atLeastRecentPerCategory: 35,
  dateRanges: [
    { id: '1950-1988', start: '1950-01-01', end: '1989-01-01', limit: 120 },
    { id: '1989-2006', start: '1989-01-01', end: '2007-01-01', limit: 120 },
  ],
  representativenessClaim: false,
};

function hasExactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

export function validBirthFact(qid, fact) {
  if (!hasExactKeys(fact, ['value', 'statementUri', 'precision'])
    || typeof fact.value !== 'string' || !/^\d{4}-\d{2}-\d{2}T00:00:00Z$/u.test(fact.value)
    || fact.value < '1950-01-01T00:00:00Z' || fact.value >= '2007-01-01T00:00:00Z'
    || !Number.isInteger(fact.precision) || fact.precision < 9 || fact.precision > 11
    || typeof fact.statementUri !== 'string' || fact.statementUri.length > 160
    || !fact.statementUri.startsWith('http://www.wikidata.org/entity/statement/')) return false;
  const statementId = fact.statementUri.split('/').pop();
  const statementEntityId = statementId?.split(/[-$]/u)[0];
  return Boolean(statementId && /^Q\d+[-$][A-Fa-f0-9-]+$/iu.test(statementId)
    && statementEntityId?.toLowerCase() === qid.toLowerCase()
    && fact.statementUri === `http://www.wikidata.org/entity/statement/${statementId}`);
}

export function assertPublicReferenceBoundary(source) {
  if (JSON.stringify(source?.selectionPolicy) !== JSON.stringify(expectedSelectionPolicy)) {
    throw new Error('Invalid pinned public-reference selection policy');
  }
  if (!Array.isArray(source.records) || source.records.length !== expectedSelectionPolicy.corpusSize) {
    throw new Error('Invalid pinned public-reference corpus size');
  }
  const categoryCounts = new Map(expectedSelectionPolicy.categories.map(({ id }) => [id, 0]));
  const recentCounts = new Map(expectedSelectionPolicy.categories.map(({ id }) => [id, 0]));
  for (const raw of source.records) {
    if (!qidPattern.test(raw?.qid ?? '') || !Number.isSafeInteger(raw?.sitelinks) || raw.sitelinks < 20) {
      throw new Error(`Record outside the pinned public-reference notability boundary: ${raw?.qid ?? 'unknown'}`);
    }
    if (!Array.isArray(raw.birthDates) || raw.birthDates.some((fact) => !validBirthFact(raw.qid, fact))) {
      throw new Error(`Record outside the pinned public-reference birth boundary: ${raw.qid}`);
    }
    if (!categoryCounts.has(raw.category)) throw new Error(`Record outside the pinned category boundary: ${raw.qid}`);
    categoryCounts.set(raw.category, (categoryCounts.get(raw.category) ?? 0) + 1);
    if (raw.birthDates.some(({ value }) => value >= '1989-01-01T00:00:00Z')) {
      recentCounts.set(raw.category, (recentCounts.get(raw.category) ?? 0) + 1);
    }
  }
  for (const { id } of expectedSelectionPolicy.categories) {
    if (categoryCounts.get(id) !== expectedSelectionPolicy.perCategory
      || (recentCounts.get(id) ?? 0) < expectedSelectionPolicy.atLeastRecentPerCategory) {
      throw new Error(`Corpus does not satisfy the pinned ${id} category allocation`);
    }
  }
}
