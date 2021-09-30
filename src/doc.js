/* doc.js describes an object that contains a Serifu document, along with metadata computed by the object at the time of instantiation. It provides up-to-date information on Sources and Styles for autocomplete purposes, along with other state important to functionality but not strictly speaking part of the document itself. */

import { parser } from "./serifu-parser/serifu-parser.js";

export class SerifuDoc {
  constructor(docText) {
    console.log(`docText length: ${docText.length}`);
    this.sources = [];
    this.styles = [];
    // parse the initial document text
    let startTree = parser.parse(docText);
    let cursor = startTree.cursor();
    // go through the parse tree and extract Sources and Styles
    do {
      console.log(`On node: ${cursor.name}`);
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
    console.log("Doc obj created.");
    console.log(`Unique sources found: ${JSON.stringify(this.sources)}`);
    console.log(`Unique styles found: ${JSON.stringify(this.styles)}`);
  }
}
