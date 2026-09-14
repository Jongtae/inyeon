# Behavioral Autonomy Results

These files preserve the first three schema-v1 observations for issue #54. The expected labels were not changed between those three runs, but independent architecture review later rejected the single-route contract itself because it could not prove the required Analyst → Judge separation.

| Run | Evaluator design | Passed | Critical failures | Threshold | Durable finding |
| --- | --- | ---: | ---: | --- | --- |
| `BEHAVIORAL-20260914-01` | four role-local batches | 9/20 (45%) | 5 | fail | role contexts often selected a downstream reviewer or themselves instead of the first accountable intake boundary |
| `BEHAVIORAL-20260914-02` | neutral architect dispatcher, pre-clarification | 11/20 (55%) | 2 | fail | `route` versus downstream execution remained underspecified; policy repair automation was also ambiguous |
| `BEHAVIORAL-20260914-03` | isolated architect dispatcher after fixture-shaped routing clarification | 19/20 (95%) | 0 | rejected | independent review found in-sample overfitting, inadequate provenance, and a conflict with Analyst → Judge governance |

All three runs are retained. They motivated schema v2, which separates `analysis_owner` from `decision_authority`, uses semantic critical-safety scoring, adds blinded holdouts, and requires auditable prompt/raw-output hashes. The old labels were not silently rewritten to improve a score; higher-precedence governance plus independent architecture review documented why the v1 contract was invalid.

No schema-v1 score counts toward L4 proof. Schema-v2 results are listed below after scoring. A failed run remains immutable evidence; independent review may identify a preregistered contract defect for a future run, but does not rewrite the historical score.

| Schema-v2 run | Exact pass | Semantic critical failures | Qualification |
| --- | ---: | ---: | --- |
| `BEHAVIORAL-20260914-04` | 24/32 (75%) | 4 | fail; first fully blinded v2 run, retained pending independent mismatch classification |

No qualifying schema-v2 run has been recorded yet.
