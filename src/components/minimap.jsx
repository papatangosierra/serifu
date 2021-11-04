import React from "react";
import ReactDOM from "react-dom";

// my imports
import { insertCharAtCursor } from "../commands.js";
import { theDoc, view } from "../editor.js";

class MinimapLine extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <line></line>;
  }
}

class MinimapSfx extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <sfx></sfx>;
  }
}

class MinimapPanel extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <panel></panel>;
  }
}

class MinimapPage extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <pageframe>
        <page></page>
      </pageframe>
    );
  }
}

class MinimapSpread extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <pageframe>
        <spread></spread>
      </pageframe>
    );
  }
}

class Minimap extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <minimap>
        <page-spacer></page-spacer>
        <page-spacer></page-spacer>
      </minimap>
    );
  }
}
