/* GENERAL CODEMIRROR SETUP */
import {
  EditorState,
  basicSetup,
} from "./setup.js"; /* my edited version of the basic-setup package */
import { syntaxTree } from "@codemirror/language";
import {
  EditorView,
  Decoration,
  ViewUpdate,
  ViewPlugin,
} from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { HighlightStyle } from "@codemirror/highlight";

/* SERIFU-SPECIFIC IMPORTS BEGIN HERE */
import { highlightStyleOptions } from "./parsersetup.js";
import { serifu, serifuHighlighter, reparseFromField } from "./parsersetup.js";
import { testDoc } from "./testDoc.js";
import { SerifuDoc } from "./doc.js";
import {
  SourceWidget,
  sourceLabels,
  sourceLabelsPlugin,
} from "./sourcewidget.js";

import { nodeInspector } from "./nodeinspector.js";
import { insertNewlineAndRenumberPages } from "./commands.js";

// make a new basic theme
let baseTheme = EditorView.baseTheme({
  ".cm-line": {
    lineHeight: "160%",
  },
});

/* Open doc and instantiate editor */
let theDoc = new SerifuDoc(testDoc);

let view = new EditorView({
  state: EditorState.create({
    doc: testDoc,
    extensions: [
      basicSetup,
      baseTheme,
      serifu(),
      serifuHighlighter,
      sourceLabelsPlugin,
      nodeInspector(),
      // EditorView.updateListener.of((update) => {
      //   // console.log("we're doing it");
      //   if (update.docChanged) {
      //     numberPages(update.view);
      //   }
      // }),
    ],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});

document.getElementById("hitpages").addEventListener("click", () => {
  insertNewlineAndRenumberPages(view);
});
