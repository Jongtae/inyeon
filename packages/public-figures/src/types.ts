export type PublicFigureCategory = 'actor' | 'music' | 'sports' | 'creator';
export type ComparisonUnavailabilityReason =
  | 'BIRTH_DATE_OUTSIDE_ADAPTER_RANGE'
  | 'BIRTHPLACE_TIMEZONE_UNRESOLVED';

export interface PublicFigureSourceRecord {
  readonly id: `wikidata:${string}`;
  readonly sourceType: 'structured-aggregator';
  readonly publisher: 'Wikidata';
  readonly title: string;
  readonly url: `https://www.wikidata.org/wiki/${string}`;
  readonly retrievedAt: string;
  readonly revisionId: number;
  readonly license: 'CC0-1.0';
  readonly licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/';
}

export type PublicFigureBirthTime =
  | {
      readonly status: 'verified' | 'well_sourced';
      readonly localTime: string;
      readonly candidates: readonly [];
      readonly provenanceRefs: readonly [string, ...string[]];
    }
  | {
      readonly status: 'disputed';
      readonly localTime: null;
      readonly candidates: readonly {
        readonly localTime: string;
        readonly provenanceRefs: readonly [string, ...string[]];
      }[];
      readonly provenanceRefs: readonly [];
    }
  | {
      readonly status: 'date_only' | 'unknown';
      readonly localTime: null;
      readonly candidates: readonly [];
      readonly provenanceRefs: readonly [];
    };

export interface PublicFigureRecord {
  readonly kind: 'public_figure';
  readonly id: `public:wd-${string}`;
  readonly recordVersion: 'public-figure-record-v1';
  readonly dataVersion: 'public-figures-v1';
  readonly displayName: string;
  readonly aliases: readonly string[];
  readonly category: PublicFigureCategory;
  readonly regions: readonly string[];
  readonly birth: {
    readonly date: {
      readonly status: 'resolved';
      readonly value: string;
      readonly sourceQuality: 'single-structured-source';
      readonly provenanceRefs: readonly string[];
    };
    readonly place: {
      readonly status: 'resolved' | 'unknown';
      readonly value: { readonly sourceId: string; readonly label: string } | null;
      readonly sourceQuality: 'single-structured-source' | 'unknown';
      readonly provenanceRefs: readonly string[];
    };
    readonly time: PublicFigureBirthTime;
  };
  readonly sourceRecords: readonly PublicFigureSourceRecord[];
  readonly image: null;
  readonly comparisonEligibility: {
    readonly status: 'eligible' | 'unavailable';
    readonly reasons: readonly ComparisonUnavailabilityReason[];
    readonly chartContext: {
      readonly temporalSupport: 'date-only';
      readonly localDate: string;
      readonly timeZone: 'America/Los_Angeles' | 'America/New_York' | 'Asia/Seoul';
      readonly calendarKind: 'solar';
      readonly profileVersion: 'korean-saju-v1';
      readonly timezoneDataVersion: 'iana-2026c-inyeon-filter-v1';
      readonly referenceDataVersion: 'issue-12-day-hour-uncertainty-v1';
    } | null;
  };
}

export interface PublicFigureSearchEntry {
  readonly kind: 'public_figure';
  readonly id: PublicFigureRecord['id'];
  readonly displayName: string;
  readonly aliases: readonly string[];
  readonly category: PublicFigureCategory;
  readonly regions: readonly string[];
  readonly searchTerms: readonly string[];
  readonly comparisonEligibility: 'eligible' | 'unavailable';
}

export interface PublicFigureSearchQuery {
  readonly query?: string;
  readonly category?: PublicFigureCategory;
  readonly region?: string;
}
