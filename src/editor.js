import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { syntaxTree } from "@codemirror/language";
import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewUpdate,
  ViewPlugin,
} from "@codemirror/view";

import { serifu, serifuHighlighter } from "./serifu-setup.js";
import { testDoc } from "./testDoc.js";
import { SerifuDoc } from "./doc.js";
import {
  SourceWidget,
  sourceLabels,
  sourceLabelsPlugin,
} from "./sourcewidget.js";

// // build a decoration list of all syntax tree nodes that need Source labels

/* Open doc and instantiate editor */
let theDoc = new SerifuDoc(testDoc);

let view = new EditorView({
  state: EditorState.create({
    doc: testDoc,
    extensions: [basicSetup, serifu(), serifuHighlighter, sourceLabelsPlugin],
    // extensions: [basicSetup, serifu(), serifuHighlighter, sourceLabelsPlugin],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});
