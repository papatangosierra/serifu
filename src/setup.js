/* This is a customized version of the basic-setup package included with codemirror. */

import {
  EditorView,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";

// Give us tab character
import { indentWithTab } from "@codemirror/commands";

export { EditorView }; // from "@codemirror/view";
import { EditorState } from "@codemirror/state";
export { EditorState }; // from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/history";
import { foldGutter, foldKeymap } from "@codemirror/fold";
import { indentOnInput, indentUnit } from "@codemirror/language";
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/gutter";
import {
  startCompletion,
  closeCompletion,
  moveCompletionSelection,
  acceptCompletion,
} from "@codemirror/autocomplete";
/* ***************************** */
/* REMEMBER: This is my edited version of the default keymap setup!!!*/
import { defaultKeymap } from "./commands.js";
/* ***************************** */
import { bracketMatching } from "@codemirror/matchbrackets";
import { searchKeymap } from "@codemirror/search";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { lintKeymap } from "@codemirror/lint";

const completionKeymap = [
  { key: "Ctrl-Space", run: startCompletion },
  { key: "Escape", run: closeCompletion },
  { key: "ArrowDown", run: /*@__PURE__*/ moveCompletionSelection(true) },
  { key: "ArrowUp", run: /*@__PURE__*/ moveCompletionSelection(false) },
  { key: "PageDown", run: /*@__PURE__*/ moveCompletionSelection(true, "page") },
  { key: "PageUp", run: /*@__PURE__*/ moveCompletionSelection(false, "page") },
  { key: "Enter", run: acceptCompletion },
  // { key: ":", run: acceptCompletion },
  // { key: "/", run: acceptCompletion },
];

const basicSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(false),
  EditorState.tabSize.of(4),
  indentUnit.of("\t"),
  EditorView.lineWrapping,
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
    indentWithTab,
  ]),
];

export { basicSetup };
