import { parser } from "./serifu-parser/serifu-parser.js";
import { foldNodeProp, foldInside, indentNodeProp } from "@codemirror/language";
import { styleTags, tags as t } from "@codemirror/next/highlight";
import { LRLanguage, LanguageSupport } from "@codemirror/next/language";

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
