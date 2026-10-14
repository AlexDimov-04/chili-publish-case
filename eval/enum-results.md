# Enum-value enrichment experiment

Method chunks whose parameters are enums get one extra line listing the enum's values (37 of 447 method chunks). Both indexes are scored on the same eval set; embeddings are deterministic, so one run each. Reproduce with `npm run eval:enum`.

| Variant (16 cases) | hit@5 | MRR | recall@5 | missing |
|---|---|---|---|---|
| vector only (current chunks) | 1.00 | 0.81 | 0.94 | VariableController.create, FrameConstraintController.setVerticalMovement |
| vector + enum values in method chunks | 1.00 | 0.81 | 0.94 | VariableController.create, FrameConstraintController.setVerticalMovement |

Cases that changed (0):

| Question | first rank | recall@5 |
|---|---|---|

## Diagnosis

The enrichment moves `VariableController.create` in the right direction, but not into the top 5:

| Query | rank of `create` (score) before | after enrichment | score of rank 5 |
|---|---|---|---|
| required question 1 (full text) | 55 (0.207) | 23 (0.240) | 0.317 |
| sub-query "Create a list variable" | 9 (0.354) | 6 (0.384) | 0.402 |

The right chunk is within reach of a wider candidate set (top 30) but loses the top 5 to `ListVariable`-related
declarations. That points to re-ranking a wider candidate set rather than more embedding-side changes.
