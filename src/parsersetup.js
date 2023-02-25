import { parser } from "./serifu-parser/serifu-parser.js";
import { styleTags, tags as t } from "@lezer/highlight";
import { HighlightStyle } from "@codemirror/language";

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
        Text: t.operator,
        "Content!": t.literal,
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
    minWidth: "6rem",
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
  {
    // SFX sources
    tag: t.unit,
    fontStyle: "italic",
    color: "lightslategray",
  },
  {
    // text line sources
    tag: t.variableName,
    backgroundColor: "rgba(200,200,200, .25)",
    borderColor: "rgb(255,255,255, 0)",
    color: "black",
    paddingLeft: ".5ex",
    paddingRight: ".5ex",
    borderRadius: "0 .5ex .5ex 0",
    minWidth: "7rem",
    textAlign: "right",
    margin: "auto",
    display: "inline-block",
  },
  {
    // text line styles
    tag: t.propertyName,
    color: "mediumvioletred",
  },
  // {
  //   // Positioning of text outside Source and Style labels
  //   tag: t.operator,
  // },
  {
    // Content of Text Lines
    tag: t.literal,
    // position: "absolute",
    // left: "0",
    // marginLeft: "12rem",
  },
  {
    // side notes
    tag: t.comment,
    backgroundColor: "papayawhip",
    fontStyle: "italic",
  },
  {
    // italics
    tag: t.string,
    fontStyle: "italic",
    color: "red",
  },
  {
    // boldface
    tag: t.number,
    fontWeight: "bold",
    // position: "relative !important",
    // marginLeft: "0px !important",
  },
  {
    // bold italics
    tag: t.regexp,
    fontStyle: "italic",
    fontWeight: "bold",
  },
  {
    // block text
    tag: t.blockComment,
    fontFamily: "Source Code Pro",
    color: "black",
    backgroundColor: "mintcream",
  },
]);
