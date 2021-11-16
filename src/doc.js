// the char-button component renders a button that inserts a given single character at the cursor point
// import React from "react";
// import ReactDOM from "react-dom";
// import { ItemGroup } from "./components/source-list.jsx";

/* doc.js describes an object that contains a Serifu document, along with metadata computed by the object at the time of instantiation. It provides up-to-date information on Sources and Styles for autocomplete purposes, along with other state important to functionality but not strictly speaking part of the document itself. */

/* Utility Function*/
function id(str) {
  return document.getElementById(str);
}

/* my home-rolled dictionary compression */
class Squeezer {
  constructor(str) {
    if (typeof str === "string") {
      this.squeezeObj = this.squeeze(str);
    } else {
      this.squeezeObj = str;
    }
  }
  squeeze(str) {
    let origtext = str.split(/\b/); // split text on word/nonword boundary
    let uniques = origtext.filter(trueIfUnique).join("\u001f"); // build uniques list
    let seq = "";

    function trueIfUnique(val, i, self) {
      return self.indexOf(val) === i; // true if this is the first time
    } // we've seen val, false otherwise

    for (let i = 0; i < origtext.length; i++) {
      // TODO: replace with forEach
      seq += String.fromCodePoint(uniques.split("\u001f").indexOf(origtext[i]));
    }

    return { uniques, seq };
  }

  get squozed() {
    return this.squeezeObj;
  }

  sizeOfSquozed() {
    // from https://stackoverflow.com/questions/1248302/how-to-get-the-size-of-a-javascript-object
    let objectList = [];
    let stack = [this.squeezeObj];
    let bytes = 0;
    while (stack.length) {
      let value = stack.pop();

      if (typeof value === "boolean") {
        bytes += 4;
      } else if (typeof value === "string") {
        bytes += value.length * 2;
      } else if (typeof value === "number") {
        bytes += 8;
      } else if (
        typeof value === "object" &&
        objectList.indexOf(value) === -1
      ) {
        objectList.push(value);
        for (var i in value) {
          stack.push(value[i]);
        }
      }
    }
    return bytes;
  }

  // *inflate() returns an ITERATABLE that yields the next uncompressed element
  // in the given string. To get the entire uncompressed text as a single
  // string, use [...Squeeze.inflate()].join("")
  *inflate() {
    let i = 0;
    let uniquesList = this.squeezeObj.uniques.split("\u001f"); // rebuild array from string.
    while (i < this.squeezeObj.seq.length) {
      //      yield this.squeezeObj.uniques[this.squeezeObj.seq[i].charCodeAt(0)];
      yield uniquesList[this.squeezeObj.seq.charCodeAt(i)];
      i++;
    }
  }
}

import { parser } from "./serifu-parser/serifu-parser.js";

export class SerifuDoc {
  constructor(docText) {
    console.log(`docText length: ${docText.length}`);
    this.text = docText;
    // console.log("new doc with text: " + this.text);
    // we toggle these on a refresh to know whether to bother asking for a new source/style list,
    // which is useful when deciding whether or not to refresh the autocomplete extensions.

    // parse the initial document text
    this.refreshParse(this.text);
    // console.log("Doc obj created.");
    // console.log(`Unique sources found: ${JSON.stringify(this.sources)}`);
    // console.log(`Unique styles found: ${JSON.stringify(this.styles)}`);
  }
  refreshParse(text) {
    this.text = text;
    // console.log("refreshParse fired on: " + this.text);
    this.sources = [];
    this.styles = [];
    let startTree = parser.parse(text);
    this.prevSourceCount = this.sources.length;
    this.prevStyleCount = this.styles.length;
    this.lastSource = "";
    this.lastStyle = "";
    let cursor = startTree.cursor();
    // go through the parse tree and extract Sources and Styles
    do {
      if (
        // if we find a Source token, and if its contents aren't already in our array of Sources
        cursor.type.name === "Source" &&
        !this.sources.includes(text.substring(cursor.from, cursor.to))
      ) {
        // add the Source to the list
        this.sources.push(text.substring(cursor.from, cursor.to));
      }
      if (
        // if we find a Style token, and if its contents aren't already in our array of Sources
        cursor.type.name === "Style" &&
        !this.styles.includes(text.substring(cursor.from, cursor.to))
      ) {
        // add the Source to the list
        this.styles.push(text.substring(cursor.from, cursor.to));
      }
    } while (cursor.next());
  }
  // getters to check if a new source or style has been added or removed from our running list
  // on the most recent parse.
  get sourceChanged() {
    return this.sources.length != this.prevSourceCount;
  }

  get styleChanged() {
    return this.styles.length != this.prevStyleCount;
  }

  get getSources() {
    //    console.log("A document source list has been requested");
    return this.sources;
  }

  get getStyles() {
    return this.styles;
  }

  get getText() {
    return this.text;
  }

  saveToSlot(slot) {
    this.refreshParse(this.text); // refresh parse on save, just to be sure
    const s = new Squeezer(this.text.replace(/\u001f/g, "")); // strip out \u001f if it's there (it probably isn't, but if it is, for some reason, we'll lose data, because it's the separator for Squeezer dictionary fields.
    console.log(`saving to slot ${slot}`);
    localStorage.setItem(`slot-${slot}-uniques`, s.squozed.uniques);
    localStorage.setItem(`slot-${slot}-seq`, s.squozed.seq);
    console.log(
      `size of JSON save: approx. ${
        sizeOf(s.squozed.uniques) + sizeOf(s.squozed.seq)
      } bytes`
    );
    console.log(`size of native save obj: approx. ${sizeOf(s)} bytes`);
    console.log(`size of raw text: approx. ${sizeOf(this.text)} bytes`);
    localStorage.setItem(`slot-${slot}-name`, id("docname").textContent);
  }

  openFromSlot(view, slot) {
    let s = new Squeezer({
      uniques: localStorage.getItem(`slot-${slot}-uniques`),
      seq: localStorage.getItem(`slot-${slot}-seq`),
    }); // set s to the compressed text
    console.log(`loading from slot ${slot}`);
    // let newDoc = [...s.inflate()].join("");
    // console.log(newDoc);
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length, // the entire document
        insert: [...s.inflate()].join(""),
      },
    });
    id("docname").textContent = localStorage.getItem(`slot-${slot}-name`);
    this.refreshParse(view.state.doc.toString()); // refresh parse on load
  }

  /*
function autosaveToLocalStorage() {
	  console.log("saving to local storage..." + theDoc.text);
	  localStorage.setItem("autosave", theDoc.getText);
	  let d = new Date();
	  id("autosave-time").innerText =
		d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	}
*/
  // When downloadAsJSON is called on the object, it generates a blob and triggers a download
  downloadAsText(dlText) {
    let blob = new Blob([dlText], {
      type: "text/text",
    });
    let e = document.createElement("a");
    e.href = URL.createObjectURL(blob);
    e.download = id("docname").textContent + ".txt";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
    e.href = URL.revokeObjectURL(blob);
  }

  downloadAsViz() {
    let startTree = parser.parse(this.text);
    let cursor = startTree.cursor();
    let curPg = 1;
    let curPnl = 1;
    let scriptText = "";
    do {
      if (cursor.type.name === "PageToken") {
        scriptText += `Page ${curPg}\n`;
        curPg++;
        curPnl = 1; // panel numbering resets every page
      }
      if (cursor.type.name === "SpreadToken") {
        scriptText += `Pages ${curPg}-${curPg + 1}\n`;
        curPg += 2; // increment page number by two, since this is a spread
        curPnl = 1; // panel numbering resets every page
      }
      if (cursor.type.name === "PanelToken") {
        scriptText += curPnl.toString();
        curPnl++;
      }
      if (cursor.type.name === "SfxTranslation") {
        scriptText += `\t SFX:\t${this.text.substring(
          cursor.from,
          cursor.to
        )}\n`;
      }
      if (cursor.type.name === "SfxTranslation") {
        scriptText += `\t SFX:\t${this.text.substring(
          cursor.from,
          cursor.to
        )}\n`;
      }
      if (cursor.type.name === "Note") {
        scriptText += `NOTE:${this.text.substring(
          cursor.from + 1, // leave off the exclamation point
          cursor.to
        )}\n`;
      }
      if (cursor.type.name === "Source") {
        scriptText += `\t${this.text.substring(cursor.from, cursor.to).trim()}`;
      }
      if (cursor.type.name === "Style") {
        scriptText += `/${this.text.substring(cursor.from, cursor.to).trim()}`;
      }
      if (cursor.type.name === "Content") {
        scriptText += `:\t${this.text
          .substring(cursor.from, cursor.to)
          .trim()}\n`;
      }
    } while (cursor.next());
    this.downloadAsText(scriptText);
  }
  // buildMinimap returns a function that when called with React Components as arguments,
  // builds a DOM-based minimap of the current document structure and returns it for rendering.
  buildMinimap() {
    return function (Minimap, Spread, Page, Panel, Line, Sfx) {
      let startTree = parser.parse(this.text);
      let cursor = startTree.cursor();
      let curPg = 1;
      let curPnl = 1;
      do {} while (cursor.next());
    };
  }
}

function sizeOf(obj) {
  // from https://stackoverflow.com/questions/1248302/how-to-get-the-size-of-a-javascript-object
  let objectList = [];
  let stack = [obj];
  let bytes = 0;
  while (stack.length) {
    let value = stack.pop();

    if (typeof value === "boolean") {
      bytes += 4;
    } else if (typeof value === "string") {
      bytes += value.length * 2;
    } else if (typeof value === "number") {
      bytes += 8;
    } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
      objectList.push(value);
      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}
