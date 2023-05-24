import { parser } from "./serifu-parser/serifu-parser.js";
import { styleTags, tags as t } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

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
        Content: t.literal,
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
const serifuHighlightStyle = HighlightStyle.define([
  {
    // Page Lines
    tag: t.heading,
    class: "serifu-page-token",
  },
  {
    // Panel lines
    tag: t.labelName,
    class: "serifu-panel-token",
  },
  {
    // SFX lines
    tag: t.float,
    class: "serifu-sfx-line",
  },
  {
    // SFX translations
    tag: t.atom,
    class: "serifu-sfx-translation",
  },
  {
    // SFX sources
    tag: t.unit,
    class: "serifu-sfx-source",
  },
  {
    // text line sources
    tag: t.variableName,

    class: "serifu-text-origin",
  },
  {
    // text line styles
    tag: t.propertyName,
    color: "mediumvioletred",
    class: "serifu-text-style",
  },
  // {
  //   // Positioning of text outside Source and Style labels
  //   tag: t.operator,
  // },
  {
    // Content of Text Lines
    tag: t.literal,
    class: "serifu-text-content",
  },
  {
    // side notes
    tag: t.comment,
    class: "serifu-note",
  },
  {
    // italics
    tag: t.string,
    class: "serifu-italic",
  },
  {
    // boldface
    tag: t.number,
    class: "serifu-bold",
  },
  {
    // bold italics
    tag: t.regexp,
    class: "serifu-bold-italic",
  },
  {
    // block text
    tag: t.blockComment,
    class: "serifu-block-literal",
  },
]);

const serifuHighlighter = syntaxHighlighting(serifuHighlightStyle);

export { serifuHighlighter };
