import {
  LezerSyntax,
  indentNodeProp,
  continuedIndent,
  flatIndent,
  delimitedIndent,
  foldNodeProp,
} from "@codemirror/next/syntax";
import { completeSnippets } from "@codemirror/next/autocomplete";
import { javascript } from "@codemirror/next/lang-javascript";
import { TagSystem } from "@codemirror/next/highlight";
import { EditorState, EditorView, basicSetup } from "./basic-setup.js";
import { testDoc } from "./testDoc.js";
import { parser } from "./serifu-parser/serifu-parser.js";

console.log("starting with test doc:");
console.log(testDoc);

// Set up our highlighter tag system
const serifuTags = new TagSystem({
  flags: ["strong", "emphasis", "meta"], // I don't know if I need any flags?
  subtypes: 0,
  types: [
    "page",
    "panel",
    "sfx",
    "line",
    "speaker",
    "style",
    "note",
    "bold",
    "ital",
    "boldital",
  ],
});

console.log("listing tags...");
console.log(JSON.stringify(serifuTags.typeIDs, 0, 4));

// adapted from highlight/dist/index.js
// const styleTags = (tags) => serifuTags.add(tags);

// Set up our interface Serifu parser and tie it into the highlighter
// adapted from lang-javascript/dist/index.js
const serifuSyntax = LezerSyntax.define(
  // I believe withProps is incorrectly called
  // "configure" in the Lezer documentation.
  parser.withProps(
    serifuTags.add({
      "PageToken SpreadToken": "page",
      PanelToken: "panel",
      Sfx: "sfx",
      Line: "line",
      Note: "note",
      Ital: "ital",
      Bold: "bold",
      BoldItal: "boldital",
    })
  )
);

// adapted from highlight/dist/index.js
const serifuHighlighter = serifuTags.highlighter({
  page: { fontWeight: "bold" },
  panel: { textDecoration: "underline" },
  sfx: { textDecoration: "underline" },
  line: { fontWeight: "bold" },
  note: { fontStyle: "italic" },
  ital: { color: "#708" },
  bold: { color: "#219" },
  boldital: { color: "#164" },
});

// returns the extension for Serifu support
function serifuSupport() {
  return serifuSyntax.languageData.of({});
}

let view = new EditorView({
  state: EditorState.create({
    doc: testDoc,
    extensions: [basicSetup, serifuHighlighter, serifuSupport()],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});

let startTree = parser.parse(testDoc);
let cursor = startTree.cursor();
// cursor.firstChild(); // This moves the cursor from the beginning of the tree to the first child. The first child of the cursor should be the first Page node.

// This iterates over the parse tree and prints out every node
// do {
//   console.log(`Node ${cursor.name} from ${cursor.from} to ${cursor.to}`);
// } while (cursor.next());
