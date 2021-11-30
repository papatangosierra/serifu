import { parser } from "./serifu-parser/serifu-parser.js";
import { styleTags, tags as t, HighlightStyle } from "@codemirror/highlight";
import {
  LRLanguage,
  LanguageSupport,
  continuedIndent,
  flatIndent,
  indentUnit,
  indentNodeProp,
  foldNodeProp,
  foldInside,
} from "@codemirror/language";
import { buildParser } from "@lezer/generator";

export const serifuLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Text: flatIndent, // indent Lines except for comments (is this doing anything??)
        Note: flatIndent,
        Sfx: flatIndent,
        Source: flatIndent,
      }),
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
    ],
  }),
  languageData: {}, // re-indent when a new line is started.
});

export function serifu() {
  return new LanguageSupport(serifuLanguage);
}

// Definitions for our highlighter plugin
export const serifuHighlighter = HighlightStyle.define([
  {
    // Page Lines
    tag: t.heading,
    borderRadius: "0 0 .75ex 0",
    borderWidth: "2px",
    borderStyle: "none solid solid none",
    borderColor: "indianred",
    paddingRight: ".5ex",
    fontWeight: "bold",
    fontStyle: "italic",
    color: "black",
    minWidth: "4rem",
    display: "inline-block",
    textAlign: "right",
    backgroundColor: "rgba(255, 228, 225, .7)", // mistyRose
  },
  {
    // Panel lines
    tag: t.labelName,
    fontWeight: "bold",
    color: "purple",
    borderRadius: "0 0 .75ex 0",
    borderWidth: "2px",
    borderStyle: "none solid solid none",
    borderColor: "cadetBlue", // cadetBlue
    paddingRight: ".5ex",
    minWidth: "6rem",
    display: "inline-block",
    textAlign: "right",
    backgroundColor: "rgba(220, 210, 230, .4)", // aliceBlue
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
    backgroundColor: "rgba(200,200,200, .25)",
    borderColor: "rgb(255,255,255, 0)",
    color: "black",
    paddingLeft: ".5ex",
    paddingRight: ".5ex",
    borderRadius: "0 .5ex .5ex 0",
    minWidth: "8rem",
    textAlign: "right",
    margin: "auto",
    display: "inline-block",
  },
  { tag: t.propertyName, color: "mediumvioletred" }, // text line styles
  {
    tag: t.comment,
    backgroundColor: "papayawhip",
    fontStyle: "italic",
  }, // side notes
  { tag: t.string, fontStyle: "italic" }, // italics
  { tag: t.number, fontWeight: "bold" }, // boldface
  { tag: t.regexp, fontStyle: "italic", fontWeight: "bold" }, // bold italics
  {
    tag: t.blockComment,
    fontFamily: "Source Code Pro",
    color: "black",
    backgroundColor: "mintcream",
  }, // block text
]);
