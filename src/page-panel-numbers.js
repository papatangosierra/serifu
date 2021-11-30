import { gutter, GutterMarker } from "@codemirror/gutter";
import { EditorView } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { RangeSet } from "@codemirror/rangeset";
//
// this is a gutter marker for annotating pages
class pageNodeMarker extends GutterMarker {
  constructor(numbers) {
    // numbers is an array!!
    super();
    this.numbers = numbers;
  }
  eq(other) {
    return this.numbers == other.numbers;
  }
  toDOM(_view) {
    return this.numbers[1] // if there's a second number, return a spread
      ? document.createTextNode(`${this.numbers[0]}-${this.numbers[1]}`)
      : document.createTextNode(`${this.numbers[0]}`);
  }
}

// Here we're going to set up a state field that associates page and panel numbers with
// ranges in the document. The ranges will correspond to instances of PageToken, SpreadToken, and PanelToken
// as identified by the parser.

// The idea here is to be able to, given a range, be able to ask the editor state which nth
// PageToken or PanelToken it corresponds to.

// This implementation will be 1-indexed. A page number will be stored as an array, with a single-element
// array representing a page number, and a two-element array representing the page numbers of a spread.

// "pos" here is the start position of the node. "num" is an array holding its number(s)
const pageNodesEffect = StateEffect.define({
  map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), num: val.num }),
});

const pageNodesState = StateField.define({
  create() {
    return RangeSet.empty;
  },
  update(set, transaction) {
    set = set.map(transaction.changes);
    return set;
  },
});

function findPageNodes(view) {
  let pageNodes = view.state.field(pageNodesState);
  let cursor = syntaxTree(view.state).cursor();
  let effects = [];
  let pageNum = 1;
  do {
    if (cursor.type.name === "PageToken") {
      // create a State Effect for this Page, adding the value for this state field, which is:
      // {pos: location where PageToken starts,
      //  num: one or two-member array of the page numbers that apply to this token}
      effects.push(pageNodesEffect.of({ pos: cursor.from, num: [pageNum] }));
      pageNum++;
    }
    if (cursor.type.name === "SpreadToken") {
      effects.push(
        pageNodesEffect.of({ pos: cursor.from, num: [pageNum, pageNum + 1] })
      );
      pageNum += 2;
    }
  } while (cursor.next());
  // dispatch our array of State Effects
  view.dispatch({
    effects: effects,
  });
}

export const pageNumberGutter = [
  pageNodesState,
  gutter({
    class: "cm-pagenumber-gutter",
    markers: (v) => v.state.field(pageNodesState),
    initialSpacer: () => pageNodeMarker,
  }),
  EditorView.baseTheme({
    ".cm-pagenumber-gutter .cm-gutterElement": {
      color: "blue",
      paddingLeft: "5px",
      cursor: "default",
    },
  }),
];
