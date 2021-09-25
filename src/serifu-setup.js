import { parser } from "./serifu-parser/serifu-parser.js";
import { foldNodeProp, foldInside, indentNodeProp } from "@codemirror/language";
import { styleTags, tags as t, HighlightStyle } from "@codemirror/highlight";
import { LRLanguage, LanguageSupport } from "@codemirror/language";

let serifuParser = parser.configure({
  props: [
    styleTags({
      "PageToken SpreadToken": t.heading,
      PanelToken: t.labelName,
      "Sfx SfxTranslation SfxSource": t.keyword,
      Dialogue: t.literal,
      Source: t.variableName,
      Style: t.propertyName,
      Note: t.comment,
      Ital: t.string,
      Bold: t.number,
      BoldItal: t.regexp,
      BlockText: t.blockComment,
    }),
    indentNodeProp.add({
      Application: (context) =>
        context.column(context.node.from) + context.unit,
    }),
    foldNodeProp.add({
      Application: foldInside,
    }),
  ],
});

const serifuLanguage = LRLanguage.define({
  parser: serifuParser,
});

export function serifu() {
  return new LanguageSupport(serifuLanguage);
}

// Definitions for our highlighter plugin
/*
const serifuHighlighter = HighlightStyle.define({
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
  comment: { color: "magenta", fontWeight: "bold" }, // notes
  string: { fontStyle: "italic" }, // ital
  number: { fontWeight: "bold" }, // bold
  regexp: { fontStyle: "italic", fontWeight: "bold" }, // bold ital
  blockComment: { color: "red" }, // block Text Lines
});
*/
export const serifuHighlighter = HighlightStyle.define([
  {
    // Page Lines
    tag: t.heading,
    borderRadius: "3px",
    borderWidth: "3px",
    borderStyle: "solid",
    borderColor: "darkblue",
    backgroundColor: "darkblue",
    fontWeight: "bold",
    fontStyle: "italic",
    color: "lightblue",
  },
  { tag: t.labelName, fontWeight: "bold", color: "purple" }, // Panel lines
  { tag: t.keyword, textDecoration: "underline", color: "darknavyblue" }, // SFX lines
  { tag: t.literal }, // text lines
  { tag: t.variableName, backgroundColor: "mediumOrchid", color: "white" }, // text line sources
  { tag: t.propertyName, color: "magenta", fontWeight: "bold" }, // text line styles
  { tag: t.comment, color: "magenta", fontWeight: "bold" }, // side notes
  { tag: t.string, fontStyle: "italic" }, // italics
  { tag: t.number, fontWeight: "bold" }, // boldface
  { tag: t.regexp, fontStyle: "italic", fontWeight: "bold" }, // bold italics
  { tag: t.blockComment, color: "red" }, // block text
]);

/*
const defaultHighlightStyle = HighlightStyle.define([
  { tag: tags.link, textDecoration: "underline" },
  { tag: tags.heading, textDecoration: "underline", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.keyword, color: "#708" },
  {
    tag: [
      tags.atom,
      tags.bool,
      tags.url,
      tags.contentSeparator,
      tags.labelName,
    ],
    color: "#219",
  },
  { tag: [tags.literal, tags.inserted], color: "#164" },
  { tag: [tags.string, tags.deleted], color: "#a11" },
  {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: "#e40",
  },
  { tag: tags.definition(tags.variableName), color: "#00f" },
  { tag: tags.local(tags.variableName), color: "#30a" },
  { tag: [tags.typeName, tags.namespace], color: "#085" },
  { tag: tags.className, color: "#167" },
  {
    tag: [tags.special(tags.variableName), tags.macroName],
    color: "#256",
  },
  { tag: tags.definition(tags.propertyName), color: "#00c" },
  { tag: tags.comment, color: "#940" },
  { tag: tags.meta, color: "#7a757a" },
  { tag: tags.invalid, color: "#f00" },
]);

*/
