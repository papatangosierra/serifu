import { EditorView } from "@codemirror/view";
import { Panel, showPanel } from "@codemirror/panel";
import { Text } from "@codemirror/text";

import { parser } from "./serifu-parser/serifu-parser.js";

function pollNodeAt(curpos, view) {
  let docArray = view.viewState.state.doc.toJSON();
  let doc = "";
  for (let i = 0; i < docArray.length; i++) {
    doc += docArray[i].concat("\n");
  }
  // console.log(doc);
  let parsetree = parser.parse(doc);
  // console.log(`checking current cursor position: ${curpos}`);
  return { curpos: curpos, name: parsetree.resolve(curpos).name };
}

function pollNodePanel(view) {
  let dom = document.createElement("div");
  let pollResults = pollNodeAt(
    view.viewState.state.selection.ranges[0].from,
    view
  );
  dom.textContent = `Position: ${pollResults.curpos}, Node: ${pollResults.name}`;
  return {
    dom: dom,
    update: function (update) {
      // dom.textContent = `Position: no, Node: fuck off`;
      let pollResults = pollNodeAt(
        view.viewState.state.selection.ranges[0].from,
        view
      );
      dom.textContent = `Position: ${pollResults.curpos}, Node: ${pollResults.name}`;
    },
  };
}

export function nodeInspector() {
  return showPanel.of(pollNodePanel);
}