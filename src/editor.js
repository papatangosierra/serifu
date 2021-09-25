import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
import { serifu, serifuHighlighter } from "./serifu-setup.js";
import { testDoc } from "./testDoc.js";

let view = new EditorView({
  state: EditorState.create({
    doc: testDoc,
    extensions: [basicSetup, serifu(), serifuHighlighter],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});
