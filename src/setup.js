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
import { indentOnInput } from "@codemirror/language";
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/gutter";
/* ***************************** */
/* REMEMBER: This is my edited version of the default keymap setup!!!*/
import { defaultKeymap } from "./commands.js";
/* ***************************** */
import { bracketMatching } from "@codemirror/matchbrackets";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { lintKeymap } from "@codemirror/lint";

const basicSetup = [
  /*@__PURE__*/ lineNumbers(),
  /*@__PURE__*/ highlightActiveLineGutter(),
  /*@__PURE__*/ highlightSpecialChars(),
  /*@__PURE__*/ history(),
  /*@__PURE__*/ foldGutter(),
  /*@__PURE__*/ drawSelection(),
  /*@__PURE__*/ EditorState.allowMultipleSelections.of(true),
  /*@__PURE__*/ indentOnInput(),
  defaultHighlightStyle.fallback,
  /*@__PURE__*/ bracketMatching(),
  /*@__PURE__*/ autocompletion(),
  /*@__PURE__*/ highlightActiveLine(),
  /*@__PURE__*/ highlightSelectionMatches(),
  /*@__PURE__*/ keymap.of([
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];

export { basicSetup };
