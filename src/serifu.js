import { parser } from "./serifu-parser/serifu-parser.js";
import {
  LezerSyntax,
  indentNodeProp,
  continuedIndent,
  foldNodeProp,
} from "@codemirror/next/syntax";

import { TagSystem, styleTags, highlighter } from "@codemirror/next/highlight";

// Set up our highlighter tag system
// const serifuTags = new TagSystem({
//   flags: ["strong", "emphasis", "meta"], // I don't know if I need any flags?
//   subtypes: 0,
//   types: [
//     "page",
//     "panel",
//     // "sfx",
//     // "line",
//     // "speaker",
//     // "style",
//     // "note",
//     // "bold",
//     // "ital",
//     // "boldital",
//   ],
// });

// adapted from highlight/dist/index.js
// const styleTags = (tags) => serifuTags.add(tags);

// Set up our interface Serifu parser and tie it into the highlighter
// adapted from lang-javascript/dist/index.js
const serifuSyntax = LezerSyntax.define(
  // I believe withProps is incorrectly called
  // "configure" in the Lezer documentation.
  parser.withProps(
    styleTags({
      "PageToken SpreadToken": "className",
      PanelToken: "labelName",
      // Sfx: "sfx",
      // Line: "line",
      // Note: "note",
      // Ital: "ital",
      // Bold: "bold",
      // BoldItal: "boldital",
    })
  )
);

// adapted from highlight/dist/index.js
const serifuHighlighter = highlighter({
  deleted: { textDecoration: "line-through" },
  inserted: { textDecoration: "underline" },
  link: { textDecoration: "underline" },
  strong: { fontWeight: "bold" },
  emphasis: { fontStyle: "italic" },
  keyword: { color: "#708" },
  "atom, bool": { color: "#219" },
  number: { color: "#164" },
  string: { color: "#a11" },
  "regexp, escape, string#2": { color: "#e40" },
  "variableName definition": { color: "#00f" },
  typeName: { color: "#085" },
  className: { fontWeight: "bold", fontStyle: "italic" },
  "name#2": { color: "#256" },
  "propertyName definition": { color: "#00c" },
  comment: { color: "#940" },
  meta: { color: "#555" },
  invalid: { color: "#f00" },
});

// returns the extension for Serifu support
function serifu() {
  return serifuSyntax;
}

export { parser, serifu, serifuSyntax, serifuHighlighter };
