import React from "react";
import ReactDOM from "react-dom";
// my imports
import { theDoc, view } from "../editor.js";

function MinimapLine() {
  return <div className="line"></div>;
}

function MinimapSfx() {
  return <div className="sfx"></div>;
}

function MinimapPanel(props) {
  const panelLines = props.lines.map((el, i) => {
    if (el.node === "Text") {
      return <MinimapLine key={el.node + i} lines={el.content}></MinimapLine>;
    } else {
      return <MinimapSfx key={el.node + i} lines={el.content}></MinimapSfx>;
    }
  });
  return <div className="panel">{panelLines}</div>;
}

function MinimapPage(props) {
  const pagePanels = props.panels.map((el, i) => {
    return <MinimapPanel key={el.node + i} lines={el.content}></MinimapPanel>;
  });
  return (
    <div className="pageframe">
      <div className="pagenumber">{props.pageNumber}</div>
      <div className="page">{pagePanels}</div>
    </div>
  );
}

function MinimapSpread(props) {
  const pagePanels = props.panels.map((el, i) => {
    return <MinimapPanel key={el.node + i} lines={el.content}></MinimapPanel>;
  });
  return (
    <div className="spreadframe">
      <div className="pagenumber">{props.pageNumber}</div>
      <div className="spread">{pagePanels}</div>
    </div>
  );
}

export function Minimap(props) {
  let spreadOffset = 0; // to keep track of how many two-page spreads we've hit
  const mapPages = props.docStruct.map((el, i) => {
    if (el.node === "Page") {
      return (
        <MinimapPage
          key={el.node + i}
          panels={el.content}
          pageNumber={`${i + spreadOffset + 1}`}
        ></MinimapPage>
      );
    } else {
      spreadOffset++;
      return (
        <MinimapSpread
          key={el.node + i}
          panels={el.content}
          pageNumber={`${i + spreadOffset + 1}-${i + spreadOffset}`}
        ></MinimapSpread>
      );
    }
  });
  return (
    <>
      <div className="minimap">
        <div className="page-spacer"></div>
        {mapPages}
        <div className="page-spacer"></div>
      </div>
    </>
  );
}
