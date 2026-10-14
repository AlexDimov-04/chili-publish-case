# Sample questions and outputs

Recorded with `npm run samples` against the running API on 2026-10-14. Outputs are unedited; model answers can vary between runs.

## 1. I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato *(required)*

**Type-check:** no code generated

_No code: the model reported that the retrieved context was insufficient._

**Explanation:** The provided context does not include a method to create a variable, so I cannot provide a complete snippet to create the list variable. VariableController.setListVariable can set the items to ["Banana", "Apple", "Strawberry", "Tomato"] on an existing list variable, but it requires that variable’s ID.

**Used symbols:** none

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.45 | `ListVariable` | interface | [types/VariableTypes.ts:76-81](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L76-L81) |
| 2 | 0.40 | `sdk.variable.setListVariable` | method | [controllers/VariableController.ts:653-670](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/VariableController.ts#L653-L670) |
| 3 | 0.38 | `ListVariableItem` | interface | [types/VariableTypes.ts:71-74](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L71-L74) |
| 4 | 0.32 | `VariableType` | enum | [types/VariableTypes.ts:33-44](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L33-L44) |
| 5 | 0.32 | `DataSourceVariableDisplayOptionsList` | interface | [types/VariableTypes.ts:357-360](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L357-L360) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 237 ms, generate 4566 ms, typecheck 0 ms · 831 in / 103 out tokens</sub>

---

## 2. I want to create a snapshot of the currently active page *(required)*

**Type-check:** passed

```ts
const snapshot = await sdk.page.getSnapshot();
```

**Explanation:** Omitting the page ID creates a PNG snapshot of the currently active page using default settings. The result is a Uint8Array returned directly, not wrapped in .parsedData.

**Used symbols:** `PageController.getSnapshot`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.50 | `sdk.page.getSnapshot` | method | [controllers/PageController.ts:104-131](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/PageController.ts#L104-L131) |
| 2 | 0.42 | `sdk.layout.getSelectedSnapshot` | method | [controllers/LayoutController.ts:222-231](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L222-L231) |
| 3 | 0.37 | `sdk.page.select` | method | [controllers/PageController.ts:51-60](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/PageController.ts#L51-L60) |
| 4 | 0.35 | `SnapshotSettings` | interface | [types/PageTypes.ts:18-35](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/PageTypes.ts#L18-L35) |
| 5 | 0.34 | `sdk.page.duplicate` | method | [controllers/PageController.ts:74-83](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/PageController.ts#L74-L83) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 171 ms, generate 3838 ms, typecheck 200 ms · 1080 in / 67 out tokens</sub>

---

## 3. How can I make sure that my end-user can change the position of a frame? *(required)*

**Type-check:** passed

```ts
const frameId = "YOUR_FRAME_ID"; // TODO: Replace with the ID of the frame your end-user should move.

await sdk.frame.constraints.setHorizontalMovement(frameId, true);
```

**Explanation:** This allows the end-user to change the frame’s horizontal position when the editor uses FrameEditingMode.followConstraints. It assumes the frame is selectable. The supplied context does not include methods to enable vertical movement or configure the editing mode, so this alone does not guarantee movement in both directions.

**Used symbols:** `FrameConstraintController.setHorizontalMovement`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.39 | `FrameEditingMode` | enum | [types/ConfigurationTypes.ts:10-22](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/ConfigurationTypes.ts#L10-L22) |
| 2 | 0.39 | `FrameConstraints` | type | [types/FrameTypes.ts:559-573](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L559-L573) |
| 3 | 0.39 | `sdk.frame.setImageFrameFitModePosition` | method | [controllers/FrameController.ts:558-569](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L558-L569) |
| 4 | 0.39 | `sdk.frame.constraints.setHorizontalMovement` | method | [controllers/FrameController.ts:1387-1399](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L1387-L1399) |
| 5 | 0.38 | `EndFrameAnchor` | type | [types/FrameTypes.ts:467-471](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L467-L471) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 166 ms, generate 7389 ms, typecheck 33 ms · 965 in / 213 out tokens</sub>

---

## 4. How do I change the text content of a text frame?

**Type-check:** passed

```ts
const textFrameId = "YOUR_TEXT_FRAME_ID"; // TODO: Replace with the target text frame's ID.
await sdk.experiment.setText(textFrameId, "Your new text content");
```

**Explanation:** Use sdk.experiment.setText with the text frame ID and the replacement text. This assumes the target text frame already exists; replace the placeholder ID with its actual ID.

**Used symbols:** `ExperimentController.setText`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.56 | `sdk.experiment.setText` | method | [controllers/ExperimentController.ts:82-91](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/ExperimentController.ts#L82-L91) |
| 2 | 0.52 | `sdk.experiment.getText` | method | [controllers/ExperimentController.ts:69-80](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/ExperimentController.ts#L69-L80) |
| 3 | 0.48 | `TextFrame` | type | [types/FrameTypes.ts:127-149](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L127-L149) |
| 4 | 0.46 | `sdk.tool.setTextFrame` | method | [controllers/ToolController.ts:69-74](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/ToolController.ts#L69-L74) |
| 5 | 0.45 | `TextFrame` | interface | [types/DocumentTypes.ts:113-131](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/DocumentTypes.ts#L113-L131) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 303 ms, generate 4413 ms, typecheck 13 ms · 1041 in / 99 out tokens</sub>

---

## 5. List all layouts and select the one named "Instagram"

**Type-check:** passed

```ts
const layouts = (await sdk.layout.getAll()).parsedData;
console.log(layouts);

const instagramLayout = layouts?.find(layout => layout.name === "Instagram");
if (!instagramLayout) {
  throw new Error('No layout named "Instagram" was found.');
}

await sdk.layout.select(instagramLayout.id);
```

**Explanation:** Retrieves and logs all layouts, then selects the first layout whose name is exactly "Instagram". Throws an error if no matching layout is found.

**Used symbols:** `LayoutController.getAll`, `LayoutController.select`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.52 | `sdk.layout.select` | method | [controllers/LayoutController.ts:111-119](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L111-L119) |
| 2 | 0.49 | `sdk.layout.getAll` | method | [controllers/LayoutController.ts:35-42](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L35-L42) |
| 3 | 0.48 | `sdk.layout.getSelected` | method | [controllers/LayoutController.ts:64-71](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L64-L71) |
| 4 | 0.47 | `sdk.animation.getAllOnSelectedLayout` | method | [controllers/AnimationController.ts:22-31](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/AnimationController.ts#L22-L31) |
| 5 | 0.47 | `sdk.layout.setSelectedByUser` | method | [controllers/LayoutController.ts:405-415](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L405-L415) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 242 ms, generate 6613 ms, typecheck 22 ms · 824 in / 185 out tokens</sub>

---

## 6. Find the frame named "Logo" and set its width to 200

**Type-check:** no code generated

_No code: the model reported that the retrieved context was insufficient._

**Explanation:** The context provides sdk.frame.setWidth, but no method to list frames or find a frame by name. Finding the frame named "Logo" requires additional SDK context; once its ID is available, its width can be set to "200" (pixels).

**Used symbols:** none

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.42 | `sdk.frame.setWidth` | method | [controllers/FrameController.ts:241-250](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L241-L250) |
| 2 | 0.36 | `sdk.frame.setAutoGrowMinWidth` | method | [controllers/FrameController.ts:923-935](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L923-L935) |
| 3 | 0.36 | `sdk.frame.setAutoGrowMaxWidth` | method | [controllers/FrameController.ts:937-949](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L937-L949) |
| 4 | 0.35 | `BarcodeFrame` | type | [types/FrameTypes.ts:151-176](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L151-L176) |
| 5 | 0.34 | `sdk.frame.resetWidth` | method | [controllers/FrameController.ts:341-351](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L341-L351) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 193 ms, generate 4095 ms, typecheck 0 ms · 1111 in / 69 out tokens</sub>

---

## 7. How can I get notified when the variables in the document change?

**Type-check:** no code generated

_No code: the model reported that the retrieved context was insufficient._

**Explanation:** The provided context exposes `ManagedCallbacksConfigType.events.onVariableListChanged`, whose callback receives the updated `Variable[]` list. However, it does not include a method for registering event listeners, so I cannot provide a working subscription snippet without guessing an SDK API.

**Used symbols:** none

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.44 | `DocumentVariable` | interface | [types/DocumentTypes.ts:288-299](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/DocumentTypes.ts#L288-L299) |
| 2 | 0.36 | `VariableValueChangedTrigger` | interface | [types/ActionTypes.ts:116-124](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/ActionTypes.ts#L116-L124) |
| 3 | 0.34 | `DocumentLoadedTrigger` | interface | [types/ActionTypes.ts:112-114](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/ActionTypes.ts#L112-L114) |
| 4 | 0.32 | `VariableUsagesReport` | type | [types/VariableTypes.ts:318-324](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L318-L324) |
| 5 | 0.32 | `ManagedCallbacksConfigType` | type | [types/CommonTypes.ts:85-142](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/CommonTypes.ts#L85-L142) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 208 ms, generate 5836 ms, typecheck 0 ms · 1721 in / 125 out tokens</sub>
