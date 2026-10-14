# Sample questions and outputs

Recorded with `npm run samples` against the running API on 2026-10-14. Outputs are unedited; model answers can vary between runs.

## 1. I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato *(required)*

**Type-check:** no code generated

_No code: the model reported that the retrieved context was insufficient._

**Explanation:** The provided context includes sdk.variable.setListVariable, which updates the items of an existing list variable, but no method for creating a variable. Creating a new list variable with Banana, Apple, Strawberry, and Tomato requires a creation method that is not included in this context.

**Used symbols:** none

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.45 | `ListVariable` | interface | [types/VariableTypes.ts:76-81](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L76-L81) |
| 2 | 0.40 | `sdk.variable.setListVariable` | method | [controllers/VariableController.ts:653-670](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/VariableController.ts#L653-L670) |
| 3 | 0.38 | `ListVariableItem` | interface | [types/VariableTypes.ts:71-74](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L71-L74) |
| 4 | 0.32 | `VariableType` | enum | [types/VariableTypes.ts:33-44](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L33-L44) |
| 5 | 0.32 | `DataSourceVariableDisplayOptionsList` | interface | [types/VariableTypes.ts:357-360](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L357-L360) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 1598 ms, generate 3450 ms, typecheck 0 ms · 831 in / 71 out tokens</sub>

---

## 2. I want to create a snapshot of the currently active page *(required)*

**Type-check:** passed

```ts
const snapshot = await sdk.page.getSnapshot();
```

**Explanation:** Omitting the page ID captures the currently active page using the default snapshot settings. The result is a Uint8Array containing PNG image data, returned directly rather than in .parsedData.

**Used symbols:** `PageController.getSnapshot`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.50 | `sdk.page.getSnapshot` | method | [controllers/PageController.ts:104-131](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/PageController.ts#L104-L131) |
| 2 | 0.42 | `sdk.layout.getSelectedSnapshot` | method | [controllers/LayoutController.ts:222-231](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L222-L231) |
| 3 | 0.37 | `sdk.page.select` | method | [controllers/PageController.ts:51-60](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/PageController.ts#L51-L60) |
| 4 | 0.35 | `SnapshotSettings` | interface | [types/PageTypes.ts:18-35](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/PageTypes.ts#L18-L35) |
| 5 | 0.34 | `sdk.page.duplicate` | method | [controllers/PageController.ts:74-83](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/PageController.ts#L74-L83) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 243 ms, generate 4858 ms, typecheck 203 ms · 1080 in / 69 out tokens</sub>

---

## 3. How can I make sure that my end-user can change the position of a frame? *(required)*

**Type-check:** passed

```ts
const frameId = 'YOUR_FRAME_ID'; // TODO: Replace with the ID of the frame to make movable.
await sdk.frame.constraints.setHorizontalMovement(frameId, true);
```

**Explanation:** This allows the end-user to move the specified frame horizontally when editing in followConstraints mode, assuming the frame is selectable. Vertical movement is a separate constraint; the provided context does not include a method to enable it or to change the editing mode.

**Used symbols:** `FrameConstraintController.setHorizontalMovement`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.39 | `FrameEditingMode` | enum | [types/ConfigurationTypes.ts:10-22](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/ConfigurationTypes.ts#L10-L22) |
| 2 | 0.39 | `FrameConstraints` | type | [types/FrameTypes.ts:559-573](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L559-L573) |
| 3 | 0.39 | `sdk.frame.setImageFrameFitModePosition` | method | [controllers/FrameController.ts:558-569](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L558-L569) |
| 4 | 0.39 | `sdk.frame.constraints.setHorizontalMovement` | method | [controllers/FrameController.ts:1387-1399](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L1387-L1399) |
| 5 | 0.38 | `EndFrameAnchor` | type | [types/FrameTypes.ts:467-471](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L467-L471) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 206 ms, generate 9018 ms, typecheck 40 ms · 965 in / 253 out tokens</sub>

---

## 4. How do I change the text content of a text frame?

**Type-check:** passed

```ts
const frameId = "YOUR_TEXT_FRAME_ID"; // TODO: Replace with the target text frame's ID.
const newText = "Updated text content";

await sdk.experiment.setText(frameId, newText);
```

**Explanation:** Use sdk.experiment.setText to replace a text frame’s content. This assumes you know the target text frame’s ID; replace the placeholder with that ID and set newText to your desired content.

**Used symbols:** `ExperimentController.setText`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.56 | `sdk.experiment.setText` | method | [controllers/ExperimentController.ts:82-91](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/ExperimentController.ts#L82-L91) |
| 2 | 0.52 | `sdk.experiment.getText` | method | [controllers/ExperimentController.ts:69-80](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/ExperimentController.ts#L69-L80) |
| 3 | 0.48 | `TextFrame` | type | [types/FrameTypes.ts:127-149](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L127-L149) |
| 4 | 0.46 | `sdk.tool.setTextFrame` | method | [controllers/ToolController.ts:69-74](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/ToolController.ts#L69-L74) |
| 5 | 0.45 | `TextFrame` | interface | [types/DocumentTypes.ts:113-131](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/DocumentTypes.ts#L113-L131) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 219 ms, generate 4737 ms, typecheck 18 ms · 1041 in / 111 out tokens</sub>

---

## 5. List all layouts and select the one named "Instagram"

**Type-check:** passed

```ts
const layouts = (await sdk.layout.getAll()).parsedData;
if (!layouts) {
  throw new Error("Could not retrieve layouts.");
}

console.log(layouts);

const instagramLayout = layouts.find((layout) => layout.name === "Instagram");
if (!instagramLayout) {
  throw new Error('No layout named "Instagram" was found.');
}

await sdk.layout.select(instagramLayout.id);
```

**Explanation:** Retrieves and logs all layouts, then selects the first layout whose name exactly matches "Instagram". Throws an error if layouts cannot be retrieved or no matching layout exists.

**Used symbols:** `LayoutController.getAll`, `LayoutController.select`

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.52 | `sdk.layout.select` | method | [controllers/LayoutController.ts:111-119](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L111-L119) |
| 2 | 0.49 | `sdk.layout.getAll` | method | [controllers/LayoutController.ts:35-42](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L35-L42) |
| 3 | 0.48 | `sdk.layout.getSelected` | method | [controllers/LayoutController.ts:64-71](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L64-L71) |
| 4 | 0.47 | `sdk.animation.getAllOnSelectedLayout` | method | [controllers/AnimationController.ts:22-31](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/AnimationController.ts#L22-L31) |
| 5 | 0.47 | `sdk.layout.setSelectedByUser` | method | [controllers/LayoutController.ts:405-415](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/LayoutController.ts#L405-L415) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 342 ms, generate 6387 ms, typecheck 24 ms · 824 in / 209 out tokens</sub>

---

## 6. Find the frame named "Logo" and set its width to 200

**Type-check:** no code generated

_No code: the model reported that the retrieved context was insufficient._

**Explanation:** The provided context includes sdk.frame.setWidth, but no method for finding a frame by name or listing frames. I cannot find the frame named "Logo" and set its width to 200 without an additional lookup method.

**Used symbols:** none

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.42 | `sdk.frame.setWidth` | method | [controllers/FrameController.ts:241-250](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L241-L250) |
| 2 | 0.36 | `sdk.frame.setAutoGrowMinWidth` | method | [controllers/FrameController.ts:923-935](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L923-L935) |
| 3 | 0.36 | `sdk.frame.setAutoGrowMaxWidth` | method | [controllers/FrameController.ts:937-949](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L937-L949) |
| 4 | 0.35 | `BarcodeFrame` | type | [types/FrameTypes.ts:151-176](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/FrameTypes.ts#L151-L176) |
| 5 | 0.34 | `sdk.frame.resetWidth` | method | [controllers/FrameController.ts:341-351](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/controllers/FrameController.ts#L341-L351) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 256 ms, generate 4771 ms, typecheck 0 ms · 1111 in / 61 out tokens</sub>

---

## 7. How can I get notified when the variables in the document change?

**Type-check:** no code generated

_No code: the model reported that the retrieved context was insufficient._

**Explanation:** The relevant event is ManagedCallbacksConfigType.events.onVariableListChanged, whose callback receives a Variable[] list. However, the provided context does not include a method for registering that callback, so I cannot provide a working subscription snippet without guessing an SDK API.

**Used symbols:** none

**Retrieved context (top 5):**

| # | Score | Symbol | Kind | Source |
|---|---|---|---|---|
| 1 | 0.44 | `DocumentVariable` | interface | [types/DocumentTypes.ts:288-299](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/DocumentTypes.ts#L288-L299) |
| 2 | 0.36 | `VariableValueChangedTrigger` | interface | [types/ActionTypes.ts:116-124](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/ActionTypes.ts#L116-L124) |
| 3 | 0.34 | `DocumentLoadedTrigger` | interface | [types/ActionTypes.ts:112-114](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/ActionTypes.ts#L112-L114) |
| 4 | 0.32 | `VariableUsagesReport` | type | [types/VariableTypes.ts:318-324](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/VariableTypes.ts#L318-L324) |
| 5 | 0.32 | `ManagedCallbacksConfigType` | type | [types/CommonTypes.ts:85-142](https://github.com/chili-publish/studio-sdk/blob/1.48.0/packages/sdk/src/types/CommonTypes.ts#L85-L142) |

<sub>gpt-6.1-sol · text-embedding-3-small · studio-sdk 1.48.0 · latency retrieve 343 ms, generate 6205 ms, typecheck 0 ms · 1721 in / 145 out tokens</sub>
