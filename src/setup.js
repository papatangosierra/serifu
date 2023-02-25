/* This is a customized version of the basic-setup package included with codemirror. */

import {
  EditorView,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  indentUnit,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import { history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  startCompletion,
  closeCompletion,
  moveCompletionSelection,
  acceptCompletion,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

// Give us tab character
// import { indentWithTab } from "@codemirror/commands";

/* ***************************** */
/* REMEMBER: This is my edited version of the default keymap setup!!!*/
import { defaultKeymap } from "./commands.js";
/* ***************************** */

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
  ]),
];

export { basicSetup };
export { EditorView }; // from "@codemirror/view";
export { EditorState }; // from "@codemirror/state";
