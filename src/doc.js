/* doc.js describes an object that contains a Serifu document, along with metadata computed by the object at the time of instantiation. It provides up-to-date information on Sources and Styles for autocomplete purposes, along with other state important to functionality but not strictly speaking part of the document itself. */

/* Utility Function*/
function id(str) {
  return document.getElementById(str);
}

import { parser } from "./serifu-parser/serifu-parser.js";

export class SerifuDoc {
  constructor(docText) {
    console.log(`docText length: ${docText.length}`);
    this.sources = [];
    this.styles = [];
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
  // getters to check if a new source or style has been added to our running list
  // on the most recent parse.
  get sourceAdded() {
    return this.sources.length > this.prevSourceCount;
  }

  get styleAdded() {
    return this.styles.length > this.prevStyleCount;
  }

  get getText() {
    return this.text;
  }

  // When downloadAsJSON is called on the object, it generates a blob and triggers a download
  downloadAsText(dlText) {
    let blob = new Blob([dlText], {
      type: "text/text",
    });
    let e = document.createElement("a");
    e.href = URL.createObjectURL(blob);
    e.download = "serifu_download.txt";
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
        scriptText += `\t${this.text.substring(cursor.from, cursor.to)}`;
      }
      if (cursor.type.name === "Style") {
        scriptText += `/${this.text.substring(cursor.from, cursor.to)}`;
      }
      if (cursor.type.name === "Content") {
        scriptText += `:\t${this.text.substring(cursor.from, cursor.to)}\n`;
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

class Squeezer {
  constructor(str) {
    this.squeezeObj = this.squeeze(str);
  }
  squeeze(str) {
    let origtext = str.split(/\b/); // split text on word/nonword boundary
    let uniques = origtext.filter(trueIfUnique); // build uniques list
    let seq = [];

    function trueIfUnique(val, i, self) {
      return self.indexOf(val) === i; // true if this is the first time
    } // we've seen val, false otherwise

    for (let i = 0; i < origtext.length; i++) {
      // TODO: replace with forEach
      seq.push(String.fromCodePoint(uniques.indexOf(origtext[i])));
    }
    return { uniques, seq };
  }
  // *inflate() returns an ITERATABLE that yields the next uncompressed element
  // in the given string. To get the entire uncompressed text as a single
  // string, use [...Squeeze.inflate()].join("")
  *inflate() {
    let i = 0;
    while (i < this.squeezeObj.seq.length) {
      yield this.squeezeObj.uniques[this.squeezeObj.seq[i].charCodeAt(0)];
      i++;
    }
  }
}

function roughSizeOfObject(object) {
  // from https://stackoverflow.com/questions/1248302/how-to-get-the-size-of-a-javascript-object
  var objectList = [];
  var stack = [object];
  var bytes = 0;
  while (stack.length) {
    var value = stack.pop();

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
