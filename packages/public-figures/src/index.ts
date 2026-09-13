export type {
  ComparisonUnavailabilityReason,
  PublicFigureBirthTime,
  PublicFigureCategory,
  PublicFigureRecord,
  PublicFigureSearchEntry,
  PublicFigureSearchQuery,
  PublicFigureSourceRecord,
} from './types.js';

import type { PublicFigureSearchEntry, PublicFigureSearchQuery } from './types.js';

export const PUBLIC_FIGURE_DISCLOSURE = Object.freeze({
  short: 'Public reference—not a member or endorsement.',
  full: 'This is a hypothetical Korean Saju (사주, Four Pillars; 四柱) comparison using publicly sourced birth information. It does not imply endorsement, participation, romantic availability, or knowledge of this person’s private life.',
  dateOnly: 'Birth time is not available from the cited source. Time-based details are not used.',
} as const);

export function normalizePublicFigureSearchText(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/gu, ' ');
}

function safeSearchInput(value: string): boolean {
  return value.length <= 160 && !/[\p{Cc}\p{Cf}<>]/u.test(value);
}

export function searchPublicFigures(
  entries: readonly PublicFigureSearchEntry[],
  query: PublicFigureSearchQuery,
): readonly PublicFigureSearchEntry[] {
  if ((query.query && !safeSearchInput(query.query)) || (query.region && !safeSearchInput(query.region))) return [];
  const text = query.query ? normalizePublicFigureSearchText(query.query) : '';
  const region = query.region ? normalizePublicFigureSearchText(query.region) : '';
  return entries.filter((entry) => (!text || entry.searchTerms.some((term) => term.includes(text)))
    && (!query.category || entry.category === query.category)
    && (!region || entry.regions.some((candidate) => normalizePublicFigureSearchText(candidate) === region)));
}
