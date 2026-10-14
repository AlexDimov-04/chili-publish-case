# Hybrid retrieval experiment

BM25 (LanceDB FTS, English stemming, stop words removed) fused with vector search via Reciprocal Rank Fusion (k=60, top 20 from each list). Reproduce with `npm run eval:hybrid`.

| Variant (16 cases) | hit@5 | MRR | recall@5 | missing |
|---|---|---|---|---|
| vector only (current) | 1.00 | 0.81 | 0.94 | VariableController.create, FrameConstraintController.setVerticalMovement |
| hybrid, full text | 0.81 | 0.78 | 0.81 | FrameConstraintController.setHorizontalMovement, FrameConstraintController.setVerticalMovement, ManagedCallbacksConfigType, PageController.setSize |
| hybrid, camelCase-split text | 0.94 | 0.68 | 0.88 | VariableController.create, FrameConstraintController.setHorizontalMovement, FrameConstraintController.setVerticalMovement, LayoutController.getAll |
| hybrid, API name only | 0.81 | 0.66 | 0.75 | VariableController.create, FrameConstraintController.setHorizontalMovement, FrameConstraintController.setVerticalMovement, LayoutController.getAll, ManagedCallbacksConfigType, VariableController.setIsRequired |
| hybrid, name + first JSDoc sentence | 0.88 | 0.70 | 0.84 | VariableController.create, FrameConstraintController.setHorizontalMovement, FrameConstraintController.setVerticalMovement, ManagedCallbacksConfigType |
| hybrid, name + first JSDoc sentence, keyword weight 0.5 | 0.94 | 0.78 | 0.88 | VariableController.create, FrameConstraintController.setVerticalMovement, ManagedCallbacksConfigType |
