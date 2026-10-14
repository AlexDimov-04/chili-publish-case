# Retrieval eval results (end-to-end)

| Question | hit@5 | first rank | recall@5 | missing | type-check |
|---|---|---|---|---|---|
| I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato (required) | yes | 2 | 0.50 | VariableController.create | no code |
| I want to create a snapshot of the currently active page (required) | yes | 1 | 1.00 | - | pass |
| How can I make sure that my end-user can change the position of a frame? (required) | yes | 4 | 0.50 | FrameConstraintController.setVerticalMovement | pass |
| How do I change the text content of a text frame? | yes | 1 | 1.00 | - | pass |
| List all layouts and select one of them | yes | 1 | 1.00 | - | pass |
| How can I get notified when the variables in the document change? | yes | 5 | 1.00 | - | no code |
| Set the value of a short text variable to 'Hello' | yes | 1 | 1.00 | - | pass |
| Undo the last change the user made | yes | 1 | 1.00 | - | pass |
| Zoom the canvas so the whole page is visible | yes | 1 | 1.00 | - | pass |
| Add a new page to the document | yes | 1 | 1.00 | - | pass |
| Change the page size to 1000 by 500 | yes | 2 | 1.00 | - | pass |
| Rotate a frame by 45 degrees | yes | 1 | 1.00 | - | pass |
| Hide a frame so it is not visible | yes | 2 | 1.00 | - | pass |
| Make a variable mandatory for the end-user | yes | 1 | 1.00 | - | pass |
| Save the current document as JSON | yes | 1 | 1.00 | - | pass |
| Find a frame by its name and change its width to 200 | yes | 1 | 1.00 | - | pass |

**16 cases: hit@5 1.00, MRR 0.81, mean recall@5 0.94 (14/16 cases with every expected symbol retrieved)**

**End-to-end: code generated for 14/16, type-check passed for 14/14 of those**
