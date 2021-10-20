import { Text } from "@codemirror/text";
import {
  WidgetType,
  EditorView,
  Decoration,
  ViewUpdate,
  ViewPlugin,
  DecorationSet,
} from "@codemirror/view";
import { StateField, StateEffect, EditorSelection } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import {
  copyLineDown,
  copyLineUp,
  cursorCharBackward,
  cursorCharForward,
  cursorCharLeft,
  cursorCharRight,
  cursorDocEnd,
  cursorDocStart,
  cursorGroupBackward,
  cursorGroupForward,
  cursorGroupLeft,
  cursorGroupRight,
  cursorLineBoundaryBackward,
  cursorLineBoundaryForward,
  cursorLineDown,
  cursorLineEnd,
  cursorLineStart,
  cursorLineUp,
  cursorMatchingBracket,
  cursorPageDown,
  cursorPageUp,
  cursorSubwordBackward,
  cursorSubwordForward,
  cursorSyntaxLeft,
  cursorSyntaxRight,
  deleteCharBackward,
  deleteCharForward,
  deleteGroupBackward,
  deleteGroupForward,
  deleteLine,
  deleteToLineEnd,
  deleteToLineStart,
  deleteTrailingWhitespace,
  indentLess,
  indentMore,
  indentSelection,
  indentWithTab,
  insertBlankLine,
  insertNewline,
  insertNewlineAndIndent,
  insertTab,
  moveLineDown,
  moveLineUp,
  selectAll,
  selectCharBackward,
  selectCharForward,
  selectCharLeft,
  selectCharRight,
  selectDocEnd,
  selectDocStart,
  selectGroupBackward,
  selectGroupForward,
  selectGroupLeft,
  selectGroupRight,
  selectLine,
  selectLineBoundaryBackward,
  selectLineBoundaryForward,
  selectLineDown,
  selectLineEnd,
  selectLineStart,
  selectLineUp,
  selectMatchingBracket,
  selectPageDown,
  selectPageUp,
  selectParentSyntax,
  selectSubwordBackward,
  selectSubwordForward,
  selectSyntaxLeft,
  selectSyntaxRight,
  simplifySelection,
  splitLine,
  transposeChars,
} from "@codemirror/commands";

import { parser } from "./serifu-parser/serifu-parser.js";
import { theDoc } from "./editor.js";

export function insertNewlineAndRenumberPages(view) {
  // If we're in a Page or Spread node when enter is pressed
  let panelIndentString = "    ";
  let curPos = view.state.selection.ranges[0].from;
  let currentNodeName = syntaxTree(view.state).resolve(curPos).name;
  if (
    currentNodeName === "PageToken" ||
    currentNodeName === "SpreadToken" ||
    currentNodeName === "PanelToken"
  ) {
    let changes = [];
    let currentPageNumber = 1;
    let currentPanelNumber = 1;
    let newCurPos = curPos;
    let labelText = "";
    let inSpread = false; // to keep track of whether we're in a spread or a page
    syntaxTree(view.state).iterate({
      from: 0,
      to: view.state.doc.length, // we're iterating until the end of the doc
      enter: (type, from, to) => {
        // console.log("traversing tree for page count update");
        if (type.name === "PageToken" || type.name === "SpreadToken") {
          // If we're on a new page or spread, reset the panel counter
          currentPanelNumber = 1;
          // when we find a PageToken node, record its range
          if (type.name === "PageToken") {
            inSpread = false;
            // if this is a Page, build a change spec
            labelText = "# Page " + currentPageNumber.toString() + "\n";
            console.log(
              `Recording Page: from: ${from} to: ${to} label: ${labelText}`
            );
            changes.push({
              from: from,
              to: to,
              // if this is the page node that also contains the cursor, newline, otherwise no
              insert:
                curPos >= from && curPos <= to ? labelText + "\n" : labelText,
            });
            // derive new cursor position after insert
            if (curPos >= from && curPos <= to) {
              newCurPos = from + labelText.length;
            }
            currentPageNumber++;
          } else {
            inSpread = true; // we're in a spread, which the panel numbering check needs to know
            labelText =
              "## Pages " +
              currentPageNumber.toString() +
              "-" +
              (++currentPageNumber).toString() +
              "\n";
            console.log(
              `Recording Spread: from: ${from} to:${to} label: ${labelText}`
            );
            changes.push({
              from: from,
              to: to,
              insert:
                curPos >= from && curPos <= to ? labelText + "\n" : labelText,
            }); //
            // if our cursor is in this node, derive its new position after insert
            if (curPos >= from && curPos <= to) {
              newCurPos = from + labelText.length;
            }
            currentPageNumber++; // we've already incremented it once, so now we do it again for
            // if this is the panel that also contains the cursor
          }
        }
        if (type.name === "PanelToken") {
          // We subtract 1 from currentPageNumber here because it will have already been incremented
          // by the time we encounter the panel. This kind of sucks but it will work for now.
          inSpread
            ? (labelText = `\t- ${currentPageNumber - 2}-${
                currentPageNumber - 1
              }.${currentPanelNumber}\n`)
            : (labelText = `\t- ${
                currentPageNumber - 1
              }.${currentPanelNumber}\n`);
          console.log(`We're in a panel, using ${labelText}`);
          changes.push({
            from: from,
            to: to,
            // If this is the panel our cursor is currently in/on
            insert:
              curPos >= from && curPos <= to
                ? (labelText += "\t\n")
                : labelText,
          });
          if (curPos >= from && curPos <= to) {
            newCurPos = from + labelText.length - 1; // at the end of the spaces, before the newline
          }
          currentPanelNumber++;
        }
      },
    });
    view.dispatch(
      view.state.update({
        changes: changes,
        selection: EditorSelection.cursor(newCurPos),
        scrollIntoView: true,
      })
    );
    return true;
  } else {
    console.log(
      "not in Page Token, refreshing parse and inserting normal newline"
    );
    theDoc.refreshParse(view.state.doc.toString());
    insertNewlineAndIndent(view);
    return true;
  }
}

function getPageAndPanelNumberAtPos(view) {
  // this is a horrible hack
  console.log("getPageAndPanelNumberAtPos fired");
  let curPos = view.state.selection.ranges[0].from;
  let curNode = syntaxTree(view.state).resolve(curPos);
  let result = {
    page: "",
    panel: "",
  };
  while (curPos > -1 && (result.page === "" || result.panel === "")) {
    console.log("checking position " + curPos);
    // if we get to the beginning of the doc, uh, stop
    curNode = syntaxTree(view.state).resolve(curPos);
    curPos--;
    if (
      (curNode.name === "PageToken" || curNode.name === "SpreadToken") &&
      result.page === ""
    ) {
      result.page = view.state.doc
        .sliceString(curNode.from, curNode.to)
        .split(" ")[2]
        .trim();
      console.log(`We found page: ${result.page}, and should stop looking`);
    }
    if (curNode.name === "PanelToken" && result.panel === "") {
      result.panel = view.state.doc
        .sliceString(curNode.from, curNode.to)
        .split(".")[1]
        .trim();
      console.log(`We found panel: ${result.panel}, and should stop looking`);
    }
  }
  console.log(`We found page: ${result.page} and panel: ${result.panel}`);
  return result;
}

export function insertPanelAtCursor(view) {
  console.log("insertPanelAtCursor fired");
  let curPgPnl = getPageAndPanelNumberAtPos(view);
  let insertString = `\n  - ${curPgPnl.page}.${parseInt(curPgPnl.panel) + 1}\n`;
  view.dispatch({
    changes: {
      from: view.state.selection.ranges[0].from,
      to: view.state.selection.ranges[0].to,
      insert: insertString,
    },
    selection: EditorSelection.cursor(
      view.state.selection.ranges[0].from + insertString.length
    ),
  });
  return true;
}

export function insertPageAtCursor(view) {}

const emacsStyleKeymap = [
  {
    key: "Ctrl-b",
    run: cursorCharLeft,
    shift: selectCharLeft,
    preventDefault: true,
  },
  { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
  { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
  { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
  { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
  { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
  { key: "Ctrl-d", run: deleteCharForward },
  { key: "Ctrl-h", run: deleteCharBackward },
  { key: "Ctrl-k", run: deleteToLineEnd },
  { key: "Ctrl-Alt-h", run: deleteGroupBackward },
  { key: "Ctrl-o", run: splitLine },
  { key: "Ctrl-t", run: transposeChars },
  { key: "Alt-<", run: cursorDocStart },
  { key: "Alt->", run: cursorDocEnd },
  { key: "Ctrl-v", run: cursorPageDown },
  { key: "Alt-v", run: cursorPageUp },
];

const standardKeymap = /*@__PURE__*/ [
  {
    key: "ArrowLeft",
    run: cursorCharLeft,
    shift: selectCharLeft,
    preventDefault: true,
  },
  {
    key: "Mod-ArrowLeft",
    mac: "Alt-ArrowLeft",
    run: cursorGroupLeft,
    shift: selectGroupLeft,
  },
  {
    mac: "Cmd-ArrowLeft",
    run: cursorLineBoundaryBackward,
    shift: selectLineBoundaryBackward,
  },
  {
    key: "ArrowRight",
    run: cursorCharRight,
    shift: selectCharRight,
    preventDefault: true,
  },
  {
    key: "Mod-ArrowRight",
    mac: "Alt-ArrowRight",
    run: cursorGroupRight,
    shift: selectGroupRight,
  },
  {
    mac: "Cmd-ArrowRight",
    run: cursorLineBoundaryForward,
    shift: selectLineBoundaryForward,
  },
  {
    key: "ArrowUp",
    run: cursorLineUp,
    shift: selectLineUp,
    preventDefault: true,
  },
  { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
  { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
  {
    key: "ArrowDown",
    run: cursorLineDown,
    shift: selectLineDown,
    preventDefault: true,
  },
  { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
  { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
  { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
  { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
  {
    key: "Home",
    run: cursorLineBoundaryBackward,
    shift: selectLineBoundaryBackward,
  },
  { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
  {
    key: "End",
    run: cursorLineBoundaryForward,
    shift: selectLineBoundaryForward,
  },
  { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
  { key: "Enter", run: insertNewlineAndRenumberPages } /* MY ADDITION */,
  { key: "Mod-a", run: selectAll },
  { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
  { key: "Delete", run: deleteCharForward, shift: deleteCharForward },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
  { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
  { mac: "Mod-Backspace", run: deleteToLineStart },
  { mac: "Mod-Delete", run: deleteToLineEnd },
].concat(
  /*@__PURE__*/ emacsStyleKeymap.map((b) => ({
    mac: b.key,
    run: b.run,
    shift: b.shift,
  }))
);

const defaultKeymap = /*@__PURE__*/ [
  {
    key: "Shift-Ctrl-Enter",
    mac: "Shift-Cmd-Enter",
    run: insertPageAtCursor,
  },
  {
    key: "Ctrl-Enter",
    mac: "Cmd-Enter",
    run: insertPanelAtCursor,
  },
  {
    key: "Alt-ArrowLeft",
    mac: "Ctrl-ArrowLeft",
    run: cursorSyntaxLeft,
    shift: selectSyntaxLeft,
  },
  {
    key: "Alt-ArrowRight",
    mac: "Ctrl-ArrowRight",
    run: cursorSyntaxRight,
    shift: selectSyntaxRight,
  },
  { key: "Alt-ArrowUp", run: moveLineUp },
  { key: "Shift-Alt-ArrowUp", run: copyLineUp },
  { key: "Alt-ArrowDown", run: moveLineDown },
  { key: "Shift-Alt-ArrowDown", run: copyLineDown },
  { key: "Escape", run: simplifySelection },
  { key: "Mod-Enter", run: insertBlankLine },
  { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
  { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
  { key: "Mod-[", run: indentLess },
  { key: "Mod-]", run: indentMore },
  { key: "Mod-Alt-\\", run: indentSelection },
  { key: "Shift-Mod-k", run: deleteLine },
  { key: "Shift-Mod-\\", run: cursorMatchingBracket },
].concat(standardKeymap);

export { defaultKeymap };
