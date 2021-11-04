// the char-button component renders a button that inserts a given single character at the cursor point
import React from "react";
import ReactDOM from "react-dom";

// my imports
import { insertCharAtCursor } from "../commands.js";
import { view } from "../editor.js";

// These are the default shortcut characters; we'll create a button component for each
let shortcutChars = ["☆", "★", "♡", "♥︎", "♪", "♫"];

// InsertCharButton is our React component for making a button that inserts a given
// string at the cursor position.
class InsertCharButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { char: props.char };
  }
  render() {
    return (
      <button
        onClick={() => {
          insertCharAtCursor(view, this.state.char);
        }}
      >
        {this.state.char}
      </button>
    );
  }
}

// Built a list of elements, one button for each character in our list
const insertButtons = shortcutChars.map((char) => (
  <InsertCharButton key={char} char={char}></InsertCharButton>
));

ReactDOM.render(
  <div>{insertButtons}</div>,
  document.getElementById("charbuttons")
);
