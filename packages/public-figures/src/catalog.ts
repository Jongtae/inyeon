import publicFigureIndexData from '../data/public-figure-index.v1.json' with { type: 'json' };
import publicFigureRecordsData from '../data/public-figures.v1.json' with { type: 'json' };

import type { PublicFigureRecord, PublicFigureSearchEntry } from './types.js';

function deepFreeze<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

const publicFigureIndex = deepFreeze(publicFigureIndexData.entries) as unknown as readonly PublicFigureSearchEntry[];
const publicFigureRecords = deepFreeze(publicFigureRecordsData.records) as unknown as readonly PublicFigureRecord[];
const publicFigureRecordsById = new Map(publicFigureRecords.map((record) => [record.id, record]));

/** Lazy-loadable immutable browse index built from the validated checked-in source corpus. */
export const PUBLIC_FIGURE_SEARCH_INDEX = publicFigureIndex;

/** Return a source-backed public reference without accepting caller-controlled lookup data. */
export function getPublicFigure(id: PublicFigureRecord['id']): PublicFigureRecord | null {
  return publicFigureRecordsById.get(id) ?? null;
}
