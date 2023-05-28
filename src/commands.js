import {
  WidgetType,
  EditorView,
  Decoration,
  ViewUpdate,
  ViewPlugin,
  DecorationSet,
} from "@codemirror/view";
import {
  StateField,
  StateEffect,
  EditorSelection,
  Text,
} from "@codemirror/state";
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
      enter: (node) => {
        // console.log("traversing tree for page count update");
        if (node.name === "PageToken" || node.name === "SpreadToken") {
          // If we're on a new page or spread, reset the panel counter
          currentPanelNumber = 1;
          // when we find a PageToken node, record its range
          if (node.name === "PageToken") {
            inSpread = false;
            // if this is a Page, build a change spec
            labelText = "# Page " + currentPageNumber.toString() + "\n";
            console.log(
              `Recording Page: from: ${node.from} to: ${node.to} label: ${labelText}`
            );
            changes.push({
              from: node.from,
              to: node.to,
              // if this is the page node that also contains the cursor, newline, otherwise no
              insert:
                curPos >= node.from && curPos <= node.to
                  ? labelText + "\n"
                  : labelText,
            });
            // derive new cursor position after insert
            if (curPos >= node.from && curPos <= node.to) {
              newCurPos = node.from + labelText.length;
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
              `Recording Spread: from: ${node.from} to:${node.to} label: ${labelText}`
            );
            changes.push({
              from: node.from,
              to: node.to,
              insert:
                curPos >= node.from && curPos <= node.to
                  ? labelText + "\n"
                  : labelText,
            }); //
            // if our cursor is in this node, derive its new position after insert
            if (curPos >= node.from && curPos <= node.to) {
              newCurPos = node.from + labelText.length;
            }
            currentPageNumber++; // we've already incremented it once, so now we do it again for
            // if this is the panel that also contains the cursor
          }
        }
        if (node.name === "PanelToken") {
          labelText = `- ${currentPanelNumber}\n`;
          console.log(`We're in a panel, using ${labelText}`);
          changes.push({
            from: node.from,
            to: node.to,
            // If this is the panel our cursor is currently in/on
            insert:
              curPos >= node.from && curPos <= node.to
                ? (labelText += "\n")
                : labelText,
          });
          if (curPos >= node.from && curPos <= node.to) {
            console.log("this is the panel containing the cursor");
            newCurPos = node.from + labelText.length - 1; // at the end of the spaces, before the newline
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
    // Right now we're refreshing the parse on every ENTER
    // keystroke. So far this seems to still give acceptable
    // performance, but if it becomes a problem we might need
    // to be more efficient about it. FIXME
    theDoc.refreshParse(view.state.doc.toString());
    insertNewlineAndIndent(view);
    return true;
  }
}

function getLastSourceAndStyle(view) {
  let curPos = view.state.selection.ranges[0].from;
  console.log(`starting cursor pos: ${curPos}`);
  let curNode = syntaxTree(view.state).resolve(curPos, -1);
  console.log(`starting node: ${curNode.name}`);
  let result = {
    source: "",
    style: "",
    lineHasAnyLength: view.state.doc.lineAt(curPos).length > 0, // we save the initial result of checking the current node for logic in newlineWithLastSourceAndStyle
  };
  while (result.source === "" && curPos > -1) {
    // don't infinite loop if we don't have any sources in the document
    // a style will always come before a source, so we know to stop once we find a source
    curNode = syntaxTree(view.state).resolve(curPos);
    curPos--;
    if (curNode.name === "Style") {
      result.style = view.state.doc
        .sliceString(curNode.from, curNode.to)
        .trim();
      curPos = curNode.from; // skip to beginning of this node, since we've found it.
    }
    if (curNode.name === "Source") {
      result.source = view.state.doc
        .sliceString(curNode.from, curNode.to)
        .trim();
    }
  }
  console.log(
    `We found source: ${result.source} and style: ${result.style} and a cursor at ${result.curNode}`
  );
  return result;
}

export function newlineWithLastSourceAndStyle(view) {
  console.log("newlineWithLastSourceAndStyle fired");
  let lastSrcStl = getLastSourceAndStyle(view);
  console.log(`lastSrcStl.lineHasAnytLength is ${lastSrcStl.lineHasAnyLength}`);
  let insertString = lastSrcStl.lineHasAnyLength ? "\n" : ""; // if we're at the end of a line, start with a newline, otherwise don't
  insertString += `${lastSrcStl.source}`;
  if (lastSrcStl.style != "") {
    insertString += "/" + lastSrcStl.style + ": ";
  } else {
    insertString += ": ";
  }
  view.dispatch({
    changes: {
      from: view.state.selection.ranges[0].from,
      to: view.state.selection.ranges[0].to,
      insert: insertString,
    },
    selection: EditorSelection.cursor(
      view.state.selection.ranges[0].from + insertString.length
    ),
    scrollIntoView: true,
  });
  return true;
}

function getPageAndPanelNumberAtPos(view) {
  // This is less of a horrible hack than it used to be.
  /* I'm trading off the horrible hack of relying on the text in the page & panel
  tokens to report accurate numbering (which directly contradicts what the Serifu
	specification says will happen) for the unsatisfyingly inefficient (but probably
	still fast enough not to matter) method of counting PageToken nodes backwards from
	the current cursor position in order to derive the correct number for the next one.
	This at least includes the optimization of not checking every cursor-previous position
	in the document, which is what I was going to grit my teeth and do until realizing
	I could use Node.prevSibling to just skip pages, using the starting position of 
	each node's position to update curPos such that the while loop still works.
	The longer-term solution to this and several other problems with the architecture
	is to add state to the syntax tree such that every page and panel knows its own order
	index, but I haven't figure out how to do that yet, and for now? This will work.
	*/
  console.log("getPageAndPanelNumberAtPos fired");
  let curPos = view.state.selection.ranges[0].from;
  let curNode = syntaxTree(view.state).resolve(curPos);
  let result = {
    page: 0,
    panel: 0,
  };
  // As long as we're not at the beginning of the document
  while (curPos >= 0) {
    console.log("checking position " + curPos);
    curNode = syntaxTree(view.state).resolve(curPos, 0); // the -1 tells resolve to resolve nodes that END at this position
    // if we find a Page that's not at the beginning of the document, and it's not the first one
    // IN the document
    console.log("current node is: " + curNode.name);
    if (curNode.name === "PageToken" && curPos > 0) {
      result.page++; // increment counter
      if (curNode.parent.prevSibling != null) {
        curPos = curNode.parent.prevSibling.from + 1; // jump curPos backward to where the previous page or panel token should be.
      } else {
        // if the current page has no previous sibling, this is the first page, so we can safely break
        break;
      }
    } else if (curNode.name === "SpreadToken") {
      result.page += 2; // increment counter by two since this is a Spread
      curPos = curNode.parent.prevSibling.from + 1; // jump curPos backward to where the previous page or panel token should be.
    } else if (curNode.name === "PanelToken" && result.page === 0) {
      // If we find a PanelToken that's not the first one and haven't found a Page of any kind yet
      console.log(`We found panel: ${result.panel}`);
      result.panel++; // count panel
      console.log(
        `Jumping back to position: ${curNode.parent.prevSibling.from + 1}`
      );
      curPos = curNode.parent.prevSibling.from + 1; // jump curPos backward to beginning of previous PanelToken
    } else {
      // If we're not in a page, spread, or panel, move backwards.
      curPos--;
    }
  }
  console.log(
    `We found page: ${result.page} and panel: ${result.panel}, 0-indexed.`
  );
  // If there are no pages or panels in the current position yet, return 0;
  // However, if there are, return a 1-indexed result for either.
  // result.page = result.page === 0 ? 0 : result.page + 1;
  // result.panel = result.panel === 0 ? 0 : result.panel + 1;
  return result;
}

export function insertCharAtCursor(view, char) {
  console.log("insertCharAtCursor fired with " + char);
  view.dispatch({
    changes: {
      from: view.state.selection.ranges[0].from,
      to: view.state.selection.ranges[0].to,
      insert: char,
    },
    selection: EditorSelection.cursor(
      view.state.selection.ranges[0].from + char.length
    ),
    scrollIntoView: true,
  });
  view.focus(); // return focus to view; it will have been shifted out because of the button-press
  return true;
}

// FIXME: insertPanelAtCursor and insertPageAtCursor don't work correctly when the document is empty, so that's an edge case to fix.
export function insertPanelAtCursor(view) {
  console.log("insertPanelAtCursor fired");
  let curPgPnl = getPageAndPanelNumberAtPos(view);
  let insertString = `\n- ${parseInt(curPgPnl.panel) + 1}\n`;
  view.dispatch({
    changes: {
      from: view.state.selection.ranges[0].from,
      to: view.state.selection.ranges[0].to,
      insert: insertString,
    },
    selection: EditorSelection.cursor(
      view.state.selection.ranges[0].from + insertString.length
    ),
    scrollIntoView: true,
  });
  return true;
}

export function insertPageAtCursor(view) {
  console.log("insertPageAtCursor fired");
  let curPgPnl = getPageAndPanelNumberAtPos(view);
  let insertString = `\n# Page ${parseInt(curPgPnl.page) + 1}\n- 1\n`;
  view.dispatch({
    changes: {
      from: view.state.selection.ranges[0].from,
      to: view.state.selection.ranges[0].to,
      insert: insertString,
    },
    selection: EditorSelection.cursor(
      view.state.selection.ranges[0].from + insertString.length
    ),
    scrollIntoView: true,
  });
  return true;
}

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
  { key: "Mod-d", run: newlineWithLastSourceAndStyle } /* MY ADDITION */,
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
