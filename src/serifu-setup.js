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
      Text: t.literal,
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
  {
    // text line sources
    tag: t.variableName,
    backgroundColor: "darkSlateGray",
    color: "white",
    borderRadius: "0 .5ex .5ex 0",
  },
  { tag: t.propertyName, color: "magenta", fontWeight: "bold" }, // text line styles
  { tag: t.comment, backgroundColor: "cornsilk", fontStyle: "italic" }, // side notes
  { tag: t.string, fontStyle: "italic" }, // italics
  { tag: t.number, fontWeight: "bold" }, // boldface
  { tag: t.regexp, fontStyle: "italic", fontWeight: "bold" }, // bold italics
  { tag: t.blockComment, color: "red" }, // block text
]);
