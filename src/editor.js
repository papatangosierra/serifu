/* GENERAL CODEMIRROR SETUP */
import {
  EditorState,
  basicSetup,
  EditorView,
} from "./setup.js"; /* my edited version of the basic-setup package */
import { syntaxTree, indentUnit, indentOnInput } from "@codemirror/language";
import { Decoration, ViewUpdate, ViewPlugin } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { HighlightStyle } from "@codemirror/view";
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
import { SerifuDoc, squeezeWorker } from "./doc.js";
import {
  SourceWidget,
  sourceLabels,
  sourceLabelsPlugin,
} from "./sourcewidget.js";

import { nodeInspector } from "./nodeinspector.js";
import { insertNewlineAndRenumberPages } from "./commands.js";
import { pageNumberGutter, findPageNodes } from "./page-panel-numbers.js";
import { Squeezer } from "./squeeze.js";
import { defaultDoc } from "./default-doc.js";
import { instanceWarning } from "./warning.js";

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
import { Minimap } from "./components/minimap.jsx";
import { ParanoiaMode } from "./components/paranoia-mode.jsx";
import { DownloadScriptAs } from "./components/download-menu.jsx";

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

// if this get set true by the following check, we won't be loading the app at all.
let DANGER_FLAG = false;
// Check instance mutex
if (localStorage.getItem("instance-mutex") != null) {
  DANGER_FLAG = true;
}

// Set up localStorage
// doing this here in global scope kind of sucks but it's okay for now
const slots = ["♥︎", "★", "✿"];
slots.forEach((slot) => {
  let s = new Squeezer(defaultDoc).squozed;
  if (!localStorage.getItem(`slot-${slot}-name`)) {
    localStorage.setItem(`slot-${slot}-name`, "Untitled Script");
  }
  if (!localStorage.getItem(`slot-${slot}-seq`)) {
    localStorage.setItem(`slot-${slot}-seq`, s.seq);
  }
  if (!localStorage.getItem(`slot-${slot}-uniques`)) {
    localStorage.setItem(`slot-${slot}-uniques`, s.uniques);
  }
});

// set up localStorage active slot default if it's not already there.
if (localStorage.getItem("current-active-slot") === null) {
  localStorage.setItem("current-active-slot", "♥︎");
}

// create a new Squeezer object with the contents of the current active slot
const curInitSlot = localStorage.getItem("current-active-slot");
const s = new Squeezer({
  uniques: localStorage.getItem(`slot-${curInitSlot}-uniques`),
  seq: localStorage.getItem(`slot-${curInitSlot}-seq`),
}); // set s to the compressed text

/* Create new doc object with uncompressed contents of current active slot */
let theDoc = new SerifuDoc([...s.inflate()].join(""));

// Set up the autocomplete Compartments. These allow us
// to reinitialize these plugins with new autocompletion lists
// whenever the lists change.
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

let myExtensions = [
  basicSetup,
  baseTheme,
  serifu(),
  serifuHighlighter,
  sourceLabelsPlugin,
  nodeInspector(),
  saveSlotPanel(),
  pageNumberGutter,
  autocompletion({ icons: true }),
  sourceCompletion.of(
    serifuLanguage.data.of({
      autocomplete: ifNotIn(
        ["Content", "Style", "Note", "Sfx"],
        completeFromList(theDoc.sources)
      ),
    })
  ),
  styleCompletion.of(
    serifuLanguage.data.of({
      autocomplete: ifNotIn(
        ["Content", "Source", "Note", "Sfx"],
        completeFromList(theDoc.styles)
      ),
    })
  ),
  updateAutoCompletion,
];

// initialize Editor View
let view = new EditorView({
  state: EditorState.create({
    doc: theDoc.getText,
    extensions: myExtensions,
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});

export { theDoc, view };

if (DANGER_FLAG) {
  // unmount editor
  document.body.innerHTML = instanceWarning;
} else {
  // Set the mutext to indicate that we're the authoritative window.
  localStorage.setItem("instance-mutex", "SET");

  // set event listener to clear mutex when we close or unload
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("instance-mutex");
  });

  // Render our React elements
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

  // We have to render the SaveSlotBar in order to initialize our save slots
  ReactDOM.render(
    /*#__PURE__*/ React.createElement(SaveSlotBar, null),
    document.getElementById("saveslotsbar")
  );

  // File download buttons (superceded by component defined in download-menu.jsx)
  //   id("dlTextBtn").addEventListener("click", () => {
  //     theDoc.downloadAsText(`${id("docname").textContent}`, theDoc.getText);
  //   });
  //
  //   id("dlVizBtn").addEventListener("click", () => {
  //     theDoc.downloadAsKUP();
  //   });

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

  // React Render calls
  ReactDOM.render(
    React.createElement(ParanoiaMode),
    document.getElementById("paranoia-mode")
  );

  ReactDOM.render(
    React.createElement(DownloadScriptAs),
    document.getElementById("downloads")
  );

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
    React.createElement(SaveSlotBar, null),
    document.getElementById("saveslotsbar")
  );

  ReactDOM.render(
    React.createElement(Minimap, {
      docStruct: theDoc.currentDocStruct,
    }),
    document.getElementById("minimap")
  );
}
