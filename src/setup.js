/* This is a customized version of the basic-setup package included with codemirror. */

import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";

export { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
export { EditorState } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/history";
import { foldGutter, foldKeymap } from "@codemirror/fold";
import { indentOnInput, indentUnit } from "@codemirror/language";
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/gutter";
/* ***************************** */
/* REMEMBER: This is my edited version of the default keymap setup!!!*/
import { defaultKeymap } from "./commands.js";
/* ***************************** */
import { bracketMatching } from "@codemirror/matchbrackets";
import { searchKeymap } from "@codemirror/search";
import { completionKeymap } from "@codemirror/autocomplete";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { lintKeymap } from "@codemirror/lint";

const basicSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  EditorState.tabSize.of(4),
  indentUnit.of("\t"),
  indentOnInput(),
  defaultHighlightStyle.fallback,
  bracketMatching(),
  highlightActiveLine(),
  keymap.of([
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];

export { basicSetup };
