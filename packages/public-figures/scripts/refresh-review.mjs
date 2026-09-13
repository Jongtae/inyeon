function sortedIds(records) {
  return [...records].sort((left, right) => left.id.localeCompare(right.id, 'en'));
}

function changedFields(previous, next) {
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
  return [...keys].filter((key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key])).sort();
}

export function createRefreshReview(baselineRecords, candidateRecords, conflicts, baselineDataVersion = null) {
  const baseline = new Map(baselineRecords.map((record) => [record.id, record]));
  const candidate = new Map(candidateRecords.map((record) => [record.id, record]));
  const addedRecordIds = sortedIds(candidateRecords.filter(({ id }) => !baseline.has(id))).map(({ id }) => id);
  const removedRecordIds = sortedIds(baselineRecords.filter(({ id }) => !candidate.has(id))).map(({ id }) => id);
  const changedRecords = [];
  const sourceRevisionOnlyChanges = [];
  for (const next of sortedIds(candidateRecords)) {
    const previous = baseline.get(next.id);
    if (!previous) continue;
    const fields = changedFields(previous, next);
    if (fields.length === 0) continue;
    if (fields.length === 1 && fields[0] === 'sourceRecords') sourceRevisionOnlyChanges.push(next.id);
    else changedRecords.push({ id: next.id, changedFields: fields });
  }
  return {
    baselineDataVersion,
    addedRecordIds,
    changedRecords,
    removedRecordIds,
    sourceRevisionOnlyChanges,
    conflicts: [...conflicts].sort((left, right) => left.qid.localeCompare(right.qid, 'en')),
  };
}
