# Sub-query retrieval experiment

The question is split into 1–3 sub-queries by an LLM; the original question and each sub-query are embedded and searched (top 5 each), then merged into 5 chunks. Means over repeated runs (± half the min–max spread). Reproduce with `npm run eval:subquery`.

| Merge | Prompt · decomposer | Runs | hit@5 | MRR | recall@5 | missing (runs) |
|---|---|---|---|---|---|---|
| vector only (current) | – | 1 | 1.00 | 0.81 | 0.94 | VariableController.create, FrameConstraintController.setVerticalMovement |
| round-robin | v1 · gpt-5.4-mini | 3 | 0.94 | 0.80 (±0.01) | 0.89 (±0.02) | VariableController.create (3/3), ManagedCallbacksConfigType (3/3), FrameConstraintController.setVerticalMovement (2/3) |
| max cosine | v1 · gpt-5.4-mini | 3 | 0.94 | 0.87 (±0.01) | 0.89 (±0.02) | VariableController.create (3/3), ManagedCallbacksConfigType (3/3), FrameConstraintController.setVerticalMovement (2/3) |
| quota + max cosine | v1 · gpt-5.4-mini | 3 | 0.94 | 0.85 (±0.02) | 0.89 (±0.02) | VariableController.create (3/3), ManagedCallbacksConfigType (3/3), FrameConstraintController.setVerticalMovement (2/3) |
| round-robin | v1 · gpt-6.1-sol | 3 | 1.00 | 0.81 (±0.01) | 0.94 | VariableController.create (3/3), FrameConstraintController.setVerticalMovement (3/3) |
| max cosine | v1 · gpt-6.1-sol | 3 | 1.00 | 0.87 (±0.02) | 0.96 (±0.02) | VariableController.create (3/3), FrameConstraintController.setVerticalMovement (1/3) |
| quota + max cosine | v1 · gpt-6.1-sol | 3 | 1.00 | 0.86 (±0.03) | 0.96 (±0.02) | VariableController.create (3/3), FrameConstraintController.setVerticalMovement (1/3) |
| round-robin | v2 · gpt-5.4-mini | 3 | 0.92 (±0.03) | 0.78 (±0.02) | 0.86 (±0.02) | VariableController.create (3/3), FrameConstraintController.setVerticalMovement (3/3), ManagedCallbacksConfigType (3/3), FrameConstraintController.setHorizontalMovement (1/3) |
| max cosine | v2 · gpt-5.4-mini | 3 | 0.98 (±0.03) | 0.86 (±0.01) | 0.93 (±0.05) | VariableController.create (3/3), FrameConstraintController.setVerticalMovement (2/3), ManagedCallbacksConfigType (1/3) |
| quota + max cosine | v2 · gpt-5.4-mini | 3 | 0.98 (±0.03) | 0.82 (±0.04) | 0.93 (±0.05) | VariableController.create (3/3), FrameConstraintController.setVerticalMovement (2/3), ManagedCallbacksConfigType (1/3) |
| round-robin | v2 · gpt-6.1-sol | 3 | 0.88 | 0.78 | 0.88 | FrameConstraintController.setHorizontalMovement (3/3), FrameConstraintController.setVerticalMovement (3/3), ManagedCallbacksConfigType (3/3) |
| max cosine | v2 · gpt-6.1-sol | 3 | 0.92 (±0.03) | 0.85 (±0.01) | 0.92 (±0.03) | FrameConstraintController.setHorizontalMovement (3/3), FrameConstraintController.setVerticalMovement (3/3), ManagedCallbacksConfigType (1/3) |
| quota + max cosine | v2 · gpt-6.1-sol | 3 | 0.92 (±0.03) | 0.85 (±0.01) | 0.92 (±0.03) | FrameConstraintController.setHorizontalMovement (3/3), FrameConstraintController.setVerticalMovement (3/3), ManagedCallbacksConfigType (1/3) |

Example decompositions (first run):

- `v1` `gpt-5.4-mini`: "I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato" → "create a list variable", "set the items of a list variable", "add multiple items to a list variable"
- `v1` `gpt-5.4-mini`: "I want to create a snapshot of the currently active page" → "create a snapshot of the active page", "get the currently active page", "capture the current page as a snapshot"
- `v1` `gpt-5.4-mini`: "How can I make sure that my end-user can change the position of a frame?" → "allow an end user to move a frame", "make a frame position editable", "enable changing the position of a frame"
- `v1` `gpt-6.1-sol`: "I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato" → "Create a list variable", "Set a list variable's items to Banana, Apple, Strawberry, and Tomato"
- `v1` `gpt-6.1-sol`: "I want to create a snapshot of the currently active page" → "Create a snapshot of the currently active page"
- `v1` `gpt-6.1-sol`: "How can I make sure that my end-user can change the position of a frame?" → "allow an end-user to change the position of a frame"
- `v2` `gpt-5.4-mini`: "I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato" → "create a list variable", "set the items of a list variable"
- `v2` `gpt-5.4-mini`: "I want to create a snapshot of the currently active page" → "create a snapshot of the active page", "get the currently active page", "create a snapshot of a page"
- `v2` `gpt-5.4-mini`: "How can I make sure that my end-user can change the position of a frame?" → "enable moving a frame", "set a frame position to be editable", "allow an end-user to reposition a frame"
- `v2` `gpt-6.1-sol`: "I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato" → "create a variable", "set the items of a list variable"
- `v2` `gpt-6.1-sol`: "I want to create a snapshot of the currently active page" → "create a snapshot of the active page"
- `v2` `gpt-6.1-sol`: "How can I make sure that my end-user can change the position of a frame?" → "set the position editing restrictions of a frame"
