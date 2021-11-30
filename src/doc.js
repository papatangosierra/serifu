import { parser } from "./serifu-parser/serifu-parser.js";
import { Squeezer } from "./squeeze.js";

/* doc.js describes an object that contains a Serifu document, along with metadata computed by the object at the time of instantiation. It provides up-to-date information on Sources and Styles for autocomplete purposes, along with other state important to functionality but not strictly speaking part of the document itself. */

/* Utility Function*/
function id(str) {
  return document.getElementById(str);
}

/* instantiate our compression web worker */

const squeezeWorker = new Worker(
  new URL("./squeeze-worker.js", import.meta.url)
); // weird worker declaration syntax courtesy of webpack

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
    this.docStruct = [];
    this.sources = [];
    this.styles = [];
    let startTree = parser.parse(text);
    this.prevSourceCount = this.sources.length;
    this.prevStyleCount = this.styles.length;
    this.lastSource = "";
    this.lastStyle = "";
    let pageCounter = -1; // hack, but if we start at -1 it's okay because we'll increment immediately and be at 0
    let panelCounter = -1;
    let cursor = startTree.cursor();
    // go through the parse tree and extract Sources and Styles, as well as building a structure tree
    // for the minimap
    do {
      if (cursor.type.name === "Page") {
        this.docStruct.push({
          node: "Page",
          content: [],
        });
        pageCounter++;
        panelCounter = -1; // reset panel counter at every new page
      }
      if (cursor.type.name === "Spread") {
        this.docStruct.push({
          node: "Spread",
          content: [],
        });
        pageCounter++; // it's okay not to increment this twice for a spread
        panelCounter = -1;
      }
      if (cursor.type.name === "Panel") {
        this.docStruct[pageCounter].content.push({
          // push into content array of current page
          node: "Panel",
          content: [],
        });
        panelCounter++;
      }
      if (cursor.type.name === "Text") {
        this.docStruct[pageCounter].content[panelCounter].content.push({
          // push into content array of current panel, of current page
          node: "Text",
          content: [],
        });
      }
      if (cursor.type.name === "Sfx") {
        this.docStruct[pageCounter].content[panelCounter].content.push({
          // push into content array of current panel, of current page
          node: "Sfx",
          content: [],
        });
      }

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
    // build the new parse available event
    const event = new CustomEvent("docParseRefreshed", {
      detail: {
        docStruct: this.docStruct,
      },
    });
    // emit parse refreshed event event
    document.dispatchEvent(event);
  }
  // getters to check if a new source or style has been added or removed from our running list
  // on the most recent parse.
  get currentDocStruct() {
    return this.docStruct;
  }
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

  saveToSlot(slot, docText, docName) {
    this.refreshParse(docText); // refresh parse on save from text in view state, just to be sure
    // send document text to squeezeWorker
    squeezeWorker.postMessage(this.text);
    squeezeWorker.onmessage = (e) => {
      localStorage.setItem(`slot-${slot}-uniques`, e.data[0]);
      localStorage.setItem(`slot-${slot}-seq`, e.data[1]);
      localStorage.setItem(`slot-${slot}-name`, docName);
    };
  }

  openFromSlot(view, slot) {
    let s = new Squeezer({
      uniques: localStorage.getItem(`slot-${slot}-uniques`),
      seq: localStorage.getItem(`slot-${slot}-seq`),
    }); // set s to the compressed text
    // console.log(`loading from slot ${slot}`);
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

  textFromSlot(slot) {
    let s = new Squeezer({
      uniques: localStorage.getItem(`slot-${slot}-uniques`),
      seq: localStorage.getItem(`slot-${slot}-seq`),
    }); // set s to the compressed text
    // console.log(`getting text from slot ${slot}`);
    // let newDoc = [...s.inflate()].join("");
    // console.log(newDoc);
    return [...s.inflate()].join("");
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
        scriptText += `\nPage ${curPg}\n`;
        curPg++;
        curPnl = 1; // panel numbering resets every page
      }
      if (cursor.type.name === "SpreadToken") {
        scriptText += `\nPages ${curPg}-${curPg + 1}\n`;
        curPg += 2; // increment page number by two, since this is a spread
        curPnl = 1; // panel numbering resets every page
      }
      if (cursor.type.name === "PanelToken") {
        scriptText += curPnl.toString();
        curPnl++;
      }
      if (cursor.type.name === "SfxTranslation") {
        scriptText += `\t SFX:\t${this.text
          .substring(cursor.from, cursor.to)
          .trim()}\n`;
      }
      if (cursor.type.name === "Note") {
        scriptText += `NOTE: ${this.text
          .substring(
            cursor.from + 1, // leave off the exclamation point
            cursor.to
          )
          .trim()}\n`;
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
