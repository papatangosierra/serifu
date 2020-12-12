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
      "PageToken SpreadToken": "heading",
      PanelToken: "labelName",
      Sfx: "keyword",
      Line: "literal",
      Source: "variableName",
      Style: "propertyName",
      Note: "comment",
      Ital: "string",
      Bold: "number",
      BoldItal: "regexp",
    })
  )
);

// adapted from highlight/dist/index.js
// possible attributes:
// {
// 	textDecoration: ""
// 	fontWeight:
// 	fontStyle:
// 	color:
// }
const serifuHighlighter = highlighter({
  heading: {
    borderRadius: "3px",
    borderWidth: "3px",
    borderStyle: "solid",
    borderColor: "darkblue",
    backgroundColor: "darkblue",
    fontWeight: "bold",
    fontStyle: "italic",
    color: "lightblue",
  }, // Page Tags
  labelName: { fontWeight: "bold", color: "purple" }, // Panel tags
  keyword: { textDecoration: "underline", color: "darknavyblue" }, // SFX lines
  literal: {}, // dialogue lines
  variableName: { backgroundColor: "mediumOrchid", color: "white" }, // dialogue sources
  propertyName: { color: "magenta", fontWeight: "bold" }, // dialogue styles
  comment: { fontStyle: "italic", color: "darkgray" }, // notes
  string: { fontStyle: "italic" }, // ital
  number: { fontWeight: "bold" }, // bold
  regexp: { fontStyle: "italic", fontWeight: "bold" }, // bold ital
});

// returns the extension for Serifu support
function serifu() {
  return serifuSyntax;
}

export { parser, serifu, serifuSyntax, serifuHighlighter };
