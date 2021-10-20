/* GENERAL CODEMIRROR SETUP */
import {
  EditorState,
  basicSetup,
} from "./setup.js"; /* my edited version of the basic-setup package */
import { syntaxTree, indentUnit, indentOnInput } from "@codemirror/language";
import {
  EditorView,
  Decoration,
  ViewUpdate,
  ViewPlugin,
} from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { HighlightStyle } from "@codemirror/highlight";
import {
  autocompletion,
  completeFromList,
  ifIn,
  ifNotIn,
} from "@codemirror/autocomplete";
/* SERIFU-SPECIFIC IMPORTS BEGIN HERE */
import { highlightStyleOptions } from "./parsersetup.js";
import { serifu, serifuHighlighter, serifuLanguage } from "./parsersetup.js";
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

/* cargo-cult programming here; I'm not sure if, or why, this may work*/
// If it does, it's because we're setting up Compartments, that allow us
// to reinitialize these plugins with new autocompletion lists.
let sourceCompletion = new Compartment(),
  styleCompletion = new Compartment();

const updateAutoCompletion = EditorState.transactionExtender.of((tr) => {
  if (!tr.docChanged) return null;
  if (theDoc.sourceAdded || theDoc.styleAdded) {
    return {
      effects: [
        sourceCompletion.reconfigure(
          serifuLanguage.data.of({
            autocomplete: ifNotIn(
              ["Content", "Style"],
              completeFromList(theDoc.sources)
            ),
          })
        ),
        styleCompletion.reconfigure(
          serifuLanguage.data.of({
            autocomplete: ifNotIn(
              ["Content", "Source"],
              completeFromList(theDoc.styles)
            ),
          })
        ),
      ],
    };
  }
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
      autocompletion({ icons: true }),
      sourceCompletion.of(
        serifuLanguage.data.of({
          autocomplete: ifNotIn(
            ["Style", "Content"],
            completeFromList(theDoc.sources)
          ),
        })
      ),
      styleCompletion.of(
        serifuLanguage.data.of({
          autocomplete: ifNotIn(
            ["Source", "Content"],
            completeFromList(theDoc.styles)
          ),
        })
      ),
      updateAutoCompletion,
      // EditorView.updateListener.of((update) => {
      //   // console.log("we're doing it");
      //   if (update.docChanged) {
      //     // theDoc.refreshParse(update.state.doc.toString());
      //   }
      // }),
    ],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});

export { theDoc };
