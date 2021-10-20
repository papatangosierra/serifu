/* doc.js describes an object that contains a Serifu document, along with metadata computed by the object at the time of instantiation. It provides up-to-date information on Sources and Styles for autocomplete purposes, along with other state important to functionality but not strictly speaking part of the document itself. */

import { parser } from "./serifu-parser/serifu-parser.js";

export class SerifuDoc {
  constructor(docText) {
    console.log(`docText length: ${docText.length}`);
    this.sources = [];
    this.styles = [];
    // we toggle these on a refresh to know whether to bother asking for a new source/style list,
    // which is useful when deciding whether or not to refresh the autocomplete extensions.

    // parse the initial document text
    this.refreshParse(docText);
    console.log("Doc obj created.");
    console.log(`Unique sources found: ${JSON.stringify(this.sources)}`);
    console.log(`Unique styles found: ${JSON.stringify(this.styles)}`);
  }
  refreshParse(docText) {
    console.log("refreshParse fired");
    let startTree = parser.parse(docText);
    this.prevSourceCount = this.sources.length;
    this.prevStyleCount = this.styles.length;
    let cursor = startTree.cursor();
    // go through the parse tree and extract Sources and Styles
    do {
      if (
        // if we find a Source token, and if its contents aren't already in our array of Sources
        cursor.type.name === "Source" &&
        !this.sources.includes(docText.substring(cursor.from, cursor.to))
      ) {
        // add the Source to the list
        this.sources.push(docText.substring(cursor.from, cursor.to));
      }
      if (
        // if we find a Source token, and if its contents aren't already in our array of Sources
        cursor.type.name === "Style" &&
        !this.styles.includes(docText.substring(cursor.from, cursor.to))
      ) {
        // add the Source to the list
        this.styles.push(docText.substring(cursor.from, cursor.to));
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
