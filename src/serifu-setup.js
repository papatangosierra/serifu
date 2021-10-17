import { parser } from "./serifu-parser/serifu-parser.js";
import { foldNodeProp, foldInside, indentNodeProp } from "@codemirror/language";
import { styleTags, tags as t, HighlightStyle } from "@codemirror/highlight";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { buildParser } from "@lezer/generator";

export function initNewParser() {
  let newParser = buildParser(
    document.getElementById("parserdef").value
  ).configure({
    props: [
      styleTags({
        "PageToken SpreadToken": t.heading,
        PanelToken: t.labelName,
        Sfx: t.float,
        SfxTranslation: t.atom,
        SfxSource: t.unit,
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
  return newParser;
}

let serifuParser = parser.configure({
  props: [
    styleTags({
      "PageToken SpreadToken": t.heading,
      PanelToken: t.labelName,
      Sfx: t.float,
      SfxTranslation: t.atom,
      SfxSource: t.unit,
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
    borderRadius: "0 0 .5ex 0",
    borderWidth: "2px",
    borderStyle: "none solid solid none",
    borderColor: "indianred",
    fontWeight: "bold",
    fontStyle: "italic",
    color: "black",
    paddingRight: "1rem",
    backgroundColor: "mistyrose",
  },
  {
    // Panel lines
    tag: t.labelName,
    fontWeight: "bold",
    color: "purple",
    borderRadius: "0 0 .5ex 0",
    borderWidth: "2px",
    borderStyle: "none solid solid none",
    borderColor: "cadetblue",
    paddingRight: "1rem",
    backgroundColor: "aliceblue",
  },
  {
    // SFX lines
    tag: t.float,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "darkslategray",
  },
  {
    // SFX translations
    tag: t.atom,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "darkslategray",
  },
  { tag: t.unit, fontStyle: "italic", color: "lightslategray" }, // SFX sources
  { tag: t.literal }, // text lines
  {
    // text line sources
    tag: t.variableName,
    backgroundColor: "whitesmoke",
    color: "black",
    paddingLeft: ".5ex",
    paddingRight: ".5ex",
    borderRadius: "0 .5ex .5ex 0",
  },
  { tag: t.propertyName, color: "mediumvioletred" }, // text line styles
  { tag: t.comment, backgroundColor: "papayawhip", fontStyle: "italic" }, // side notes
  { tag: t.string, fontStyle: "italic" }, // italics
  { tag: t.number, fontWeight: "bold" }, // boldface
  { tag: t.regexp, fontStyle: "italic", fontWeight: "bold" }, // bold italics
  { tag: t.blockComment, color: "black", backgroundColor: "mintcream" }, // block text
]);
