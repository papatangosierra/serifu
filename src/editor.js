import {
  EditorState,
  EditorView,
  basicSetup,
} from "@codemirror/next/basic-setup";
import { serifu } from "./serifu-setup.js";
import { testDoc } from "./testDoc.js";

let view = new EditorView({
  state: EditorState.create({
    doc: testDoc,
    extensions: [basicSetup, serifu()],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});
