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
// import { testDoc } from "./testDoc.js";
import { SerifuDoc } from "./doc.js";
import {
  SourceWidget,
  sourceLabels,
  sourceLabelsPlugin,
} from "./sourcewidget.js";

import { nodeInspector } from "./nodeinspector.js";
import { insertNewlineAndRenumberPages } from "./commands.js";

/* React and components setup */

import React from "react";
import ReactDOM from "react-dom";
import { insertButtons } from "./components/char-button.jsx";
import { SourceItemGroup, StyleItemGroup } from "./components/source-list.jsx";
import {
  SaveSlotBar,
  saveSlotPanel,
  manualSave,
} from "./components/save-slots.jsx";

// make a new basic theme
let baseTheme = EditorView.baseTheme({
  ".cm-line": {
    lineHeight: "160%",
  },
  ".cm-tooltip": {
    border: "1px solid darkslategrey",
    borderRadius: ".3ex",
    backgroundColor: "lavenderblush",
  },
  ".cm-tooltip-autocomplete": {
    border: "1px solid darkslategrey",
    backgroundColor: "lavenderblush",
  },
  ".cm-completionLabel": {
    fontFamily: "Nunito Sans",
  },
  ".cm-completionMatchedText": {
    textDecorationThickness: "2px",
  },
});

/* Utility Function*/
function id(str) {
  return document.getElementById(str);
}

/* cargo-cult programming here; I'm not sure if, or why, this may work*/
// If it does, it's because we're setting up Compartments, that allow us
// to reinitialize these plugins with new autocompletion lists.
let sourceCompletion = new Compartment(),
  styleCompletion = new Compartment();

const updateAutoCompletion = EditorState.transactionExtender.of((tr) => {
  if (!tr.docChanged) return null;
  if (theDoc.sourceChanged || theDoc.styleChanged) {
    return {
      effects: [
        sourceCompletion.reconfigure(
          serifuLanguage.data.of({
            autocomplete: ifNotIn(
              ["Content", "Style", "Note", "Sfx"],
              completeFromList(theDoc.getSources)
            ),
          })
        ),
        styleCompletion.reconfigure(
          serifuLanguage.data.of({
            autocomplete: ifNotIn(
              ["Content", "Source", "Note", "Sfx"],
              completeFromList(theDoc.getStyles)
            ),
          })
        ),
      ],
    };
  }
});

// set up localStorage active slot default if it's not already there.
if (localStorage.getItem("current-active-slot") === null) {
  localStorage.setItem("current-active-slot", "♥︎");
}

/* Create new doc and init editor with its (empty) contents */
let theDoc = new SerifuDoc("");

// initialize Editor View
let view = new EditorView({
  state: EditorState.create({
    doc: theDoc.getText,
    extensions: [
      basicSetup,
      baseTheme,
      serifu(),
      serifuHighlighter,
      sourceLabelsPlugin,
      nodeInspector(),
      saveSlotPanel(),
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

// Load current active save slot contents into doc
theDoc.openFromSlot(view, localStorage.getItem("current-active-slot"));

export { theDoc, view };

// File download button
id("dlTextBtn").addEventListener("click", () => {
  theDoc.downloadAsText(theDoc.getText);
});

id("dlVizBtn").addEventListener("click", () => {
  theDoc.downloadAsViz();
});

// Event listeners for save slots. "saveSlotChange" is a custom event that includes
// "docText" and "docName" attributes, which we use to update the editor view.
document.addEventListener("saveSlotChange", (e) => {
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length, // the entire document
      insert: e.detail.docText,
    },
  });
  id("docname").textContent = e.detail.docName;
  theDoc.refreshParse(view.state.doc.toString());
});

id("saveBtn").addEventListener("click", () => {
  manualSave();
});

//
// Autosave Timer
// function autosaveToLocalStorage() {
//   console.log("autosaving to local storage...");
//   theDoc.refreshParse(view.state.doc.toString());
//   localStorage.setItem("autosave", theDoc.getText);
//   let d = new Date();
//   id("autosave-time").innerText =
//     d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
// }
//
// function initAutosave(interval) {
//   setInterval(autosaveToLocalStorage, interval);
// }
//
// initAutosave(10000);

// React Render calls

ReactDOM.render(
  React.createElement("div", null, insertButtons),
  document.getElementById("charbuttons")
);

ReactDOM.render(
  React.createElement(SourceItemGroup, {
    items: theDoc.getSources,
  }),
  document.getElementById("sourcelist")
);

ReactDOM.render(
  React.createElement(StyleItemGroup, {
    items: theDoc.getStyles,
  }),
  document.getElementById("stylelist")
);

ReactDOM.render(
  /*#__PURE__*/ React.createElement(SaveSlotBar, null),
  document.getElementById("saveslotsbar")
);
