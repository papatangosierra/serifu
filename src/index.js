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
import { parser, serifu, serifuSyntax, serifuHighlighter } from "./serifu.js";

console.log("starting with test doc:");
console.log(testDoc);

let view = new EditorView({
  state: EditorState.create({
    doc: testDoc,
    extensions: [basicSetup, serifu(), serifuHighlighter],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});

let startTree = parser.parse(testDoc);
let cursor = startTree.cursor();
cursor.firstChild(); // This moves the cursor from the beginning of the tree to the first child. The first child of the cursor should be the first Page node.

// This iterates over the parse tree and prints out every node
do {
  console.log(`Node ${cursor.name} from ${cursor.from} to ${cursor.to}`);
} while (cursor.next());
