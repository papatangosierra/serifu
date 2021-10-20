import { EditorState, StateField } from "@codemirror/state";

// define a state field to hold sources and styles declared so far in the document.
// We'll need those lists for a variety of other features.

let collectSources = StateField.define({
  create() {
    return 0;
  },
  update(value, tr) {
    return tr.docChanged ? value + 1 : value;
  },
});

let state = EditorState.create({ extensions: countDocChanges });
state = state.update({ changes: { from: 0, insert: "." } }).state;
console.log(state.field(countDocChanges)); // 1
