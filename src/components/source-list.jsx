// the char-button component renders a button that inserts a given single character at the cursor point
import React from "react";
import ReactDOM from "react-dom";

// my imports
import { insertCharAtCursor } from "../commands.js";
import { view, theDoc } from "../editor.js";

// Item is our React component for a sidebar item that represents a unique Source (e.g. a character or a caption, etc) in the document.

class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = { item: props.item };
  }
  render() {
    return <li>{this.state.item}</li>;
  }
}

export class SourceItemGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: props.items };
  }

  // set up timer that polls for new items once per second
  componentDidMount() {
    this.itemPoll = setInterval(() => this.pollForItems(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.itemPoll);
  }

  // check if new sources are in theDoc and if so, update our state
  pollForItems() {
    if (theDoc.sourceChanged) {
      this.setState({ items: theDoc.getSources });
    }
  }

  render() {
    const theItems = this.state.items.map((item) => (
      <Item key={item} item={item}></Item>
    ));
    return <ul>{theItems}</ul>;
  }
}

export class StyleItemGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: props.items };
  }

  // set up timer that polls for new items once per second
  componentDidMount() {
    this.itemPoll = setInterval(() => this.pollForItems(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.itemPoll);
  }

  // check if new sources are in theDoc and if so, update our state
  pollForItems() {
    if (theDoc.styleChanged) {
      this.setState({ items: theDoc.getStyles });
    }
  }

  render() {
    const theItems = this.state.items.map((item) => (
      <Item key={item} item={item}></Item>
    ));
    return <ul>{theItems}</ul>;
  }
}

// ReactDOM.render(
//   <ItemGroup items={theDoc.getSources} />, document.getElementById('sourcelist')
// )
