export interface RefreshReviewRecord {
  readonly id: string;
}

export interface RefreshConflict {
  readonly qid: string;
  readonly reason: string;
  readonly candidateValues: readonly string[];
}

export function createRefreshReview(
  baselineRecords: readonly RefreshReviewRecord[],
  candidateRecords: readonly RefreshReviewRecord[],
  conflicts: readonly RefreshConflict[],
  baselineDataVersion?: string | null,
): {
  readonly baselineDataVersion: string | null;
  readonly addedRecordIds: readonly string[];
  readonly changedRecords: readonly { readonly id: string; readonly changedFields: readonly string[] }[];
  readonly removedRecordIds: readonly string[];
  readonly sourceRevisionOnlyChanges: readonly string[];
  readonly conflicts: readonly RefreshConflict[];
};
