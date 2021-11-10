// the char-button component renders a button that inserts a given single character at the cursor point
import React from "react";
import ReactDOM from "react-dom";

// my imports
import { view } from "../editor.js";

// SourceItem is our React component for a sidebar item that represents a unique Source (e.g. a character or a caption, etc) in the document.

class SerifuDoc extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: props.text };
  }

  render() {
    return <li>{this.state.item}</li>;
  }
}

// ReactDOM.render(
//   <SerifuDoc items={theDoc.getSources} />, document.getElementById('sidebarleft')
// )
