import { parser } from "./serifu-parser/serifu-parser.js";
import { Squeezer } from "./squeeze.js";
import { defaultDoc } from "./default-doc.js";

/* doc.js describes an object that contains a Serifu document, along with metadata computed by the object at the time of instantiation. It provides up-to-date information on Sources and Styles for autocomplete purposes, along with other state important to functionality but not strictly speaking part of the document itself. */

/* Utility Function*/
function id(str) {
  return document.getElementById(str);
}

/* deepPush pushes a given val onto the end of an array after recursively descending into any array-final elements it finds first, and returns the new full array. This also descends into "content" properties, when found*/
function deepPush(arr, val) {
  function descend(inside, into) {
    if (typeof into === "object") {
      if (into.hasOwnProperty("content")) {
        //  descend(into.content, into.content[into.content.length - 1]);
        into.content.push(val);
      } else {
        descend(into, into[into.length - 1]);
      }
    } else {
      inside.push(val);
    }
    return inside;
  }
  return descend(arr, arr[arr.length - 1]);
}
// deepEdit finds the most deeply-nested object in the last element of an array, and assigns the given attribute to the given value, returning the new array
function deepEdit(arr, attr, val) {
  function descend(inside, into) {
    if (typeof into === "object" && into.length === undefined) {
      into[attr] = val;
    } else {
      descend(into, into[into.length - 1]);
    }
    return inside;
  }
  return descend(arr, arr[arr.length - 1]);
}

/* instantiate our compression web worker */

export const squeezeWorker = new Worker(
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
          source: null,
          style: null,
          content: [],
        });
      }
      if (cursor.type.name === "Sfx") {
        this.docStruct[pageCounter].content[panelCounter].content.push({
          // push into content array of current panel, of current page
          node: "Sfx",
          sfxTranslation: null,
          sfxSource: null,
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
    let pageStruct = this.parseForIndPanel();
  }

  parseForIndPanel() {
    let cursor = parser.parse(this.text).cursor();
    let pageMap = new Map([]);
    let pageStruct = [];
    let pageOffsetWithSpreads = 0; // we increment this every time a spread is encountered, to derive an offset
    let pageNum = -1;
    let panelNum = -1;
    let lastSource = "";
    let lastStyle = "";
    do {
      if (cursor.type.name === "Page") {
        // associate current page number with index of last pageStruct element
        pageMap.set(pageNum, pageStruct.length);
        pageStruct.push([]);
        pageNum++;
        panelNum = -1;
      }
      if (cursor.type.name === "Spread") {
        // associate current AND NEXT page numbers with index of last pageStruct element
        pageMap.set(pageNum, pageStruct.length);
        pageMap.set(pageNum + 1, pageStruct.length);
        pageStruct.push([]);
        pageOffsetWithSpreads++;
        pageNum += 2;
        panelNum = -1;
      }
      if (cursor.type.name === "Panel") {
        pageStruct[pageNum - pageOffsetWithSpreads].push([]);
        panelNum++;
      }
      if (cursor.type.name === "SfxTranslation") {
        pageStruct[pageNum - pageOffsetWithSpreads][panelNum].push({
          type: "Sfx",
          text: this.text.substring(cursor.from, cursor.to).trim(),
        });
      }
      if (cursor.type.name === "Note") {
        pageStruct[pageNum - pageOffsetWithSpreads][panelNum].push({
          type: "Note",
          text: this.text.substring(cursor.from, cursor.to),
        });
      }
      if (cursor.type.name === "Text") {
        // if we've found a Text token, we can add the line and
        // assign the source simultaneously.
        pageStruct[pageNum - pageOffsetWithSpreads][panelNum].push({
          type: "Text",
          source: null,
          style: null,
          content: [],
        });
      }
      if (cursor.type.name === "Source") {
        // save this as the most recently found Source
        lastSource = this.text.substring(cursor.from, cursor.to);
        // clear any saved Styles:
        lastStyle = null;
      }
      if (cursor.type.name === "Style") {
        // save this as the most recently found Style
        lastStyle = this.text.substring(cursor.from, cursor.to);
      }
      if (cursor.type.name === "Content") {
        // If have found a Content node, we've passed Source and Style,
        // which means we can apply the last-found Source and Style to the
        // node. If the containing Text node didn't have a Source or Style
        // specified, we won't have encountered those nodes, so the last-specified
        // Source and Style will control.
        pageStruct = deepEdit(pageStruct, "source", lastSource);
        pageStruct = deepEdit(pageStruct, "style", lastStyle);
      }
      if (cursor.type.name === "Bold") {
        pageStruct = deepPush(pageStruct, {
          emphasis: "Bold",
          text: this.text.substring(cursor.from, cursor.to).replace(/\*/g, ""), // remove asterisks
        });
      }
      if (cursor.type.name === "BoldItal") {
        pageStruct = deepPush(pageStruct, {
          emphasis: "BoldItal",
          text: this.text
            .substring(cursor.from, cursor.to)
            .replace(/\*\*/g, ""), // remove double asterisks
        });
      }
      if (cursor.type.name === "Ital") {
        pageStruct = deepPush(pageStruct, {
          emphasis: "Ital",
          text: this.text.substring(cursor.from, cursor.to).replace(/\_/g, ""), // remove underscores
        });
      }
      if (cursor.type.name === "Newline") {
        pageStruct = deepPush(pageStruct, {
          emphasis: "none",
          text: "\n", // remove underscores
        });
      }
      if (
        (cursor.type.name === "UnstyledText" ||
          cursor.type.name === "BlockText" ||
          cursor.type.name === "Star" ||
          cursor.type.name === "Colon" ||
          cursor.type.name === "DoubleStar" ||
          cursor.type.name === "Underscore") &&
        (cursor.node.parent.name === "Content" ||
          cursor.node.parent.name === "StyleBlock")
      ) {
        pageStruct = deepPush(pageStruct, {
          emphasis: "none",
          text: this.text.substring(cursor.from, cursor.to), // push text as-is
        });
      }
      if (cursor.type.name === "BlockText") {
        pageStruct = deepPush(pageStruct, {
          emphasis: "BlockText",
          text: this.text.substring(cursor.from, cursor.to), // push text as-is
        });
      }
    } while (cursor.next());
    return pageStruct;
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
    console.log(`attempting to open slot ${slot}`);
    const s = new Squeezer({
      uniques: localStorage.getItem(`slot-${slot}-uniques`),
      seq: localStorage.getItem(`slot-${slot}-seq`),
    }); // set s to the compressed text
    // if there's actually anything in these slots, then uncompress it and update the view state
    // with it
    if (s.squeezeObj.uniques != null) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length, // the entire document
          insert: [...s.inflate()].join(""),
        },
      });
      id("docname").textContent = localStorage.getItem(`slot-${slot}-name`);
    } else {
      // otherwise just put the default starting document in the view state.
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length, // the entire document
          insert: defaultDoc,
        },
      });
      id("docname").textContent = "Untitled Script";
    }

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
  downloadAsText(filename, dlText) {
    let blob = new Blob([dlText], {
      type: "text/text",
    });
    let e = document.createElement("a");
    e.href = URL.createObjectURL(blob);
    e.download = filename + ".txt";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
    e.href = URL.revokeObjectURL(blob);
  }

  downloadAsViz() {
    console.log("downloadasViz called");
    let startTree = parser.parse(this.text);
    let cursor = startTree.cursor();
    let curSource = "";
    let curStyle = "";
    let curPg = 1;
    let curPnl = 1;
    let scriptText = "";
    let prevToken = "";
    do {
      if (cursor.type.name === "PageToken") {
        scriptText += `\n\nPage ${curPg}`;
        curPg++;
        curPnl = 1; // panel numbering resets every page
        prevToken = "PageToken";
      }
      if (cursor.type.name === "SpreadToken") {
        scriptText += `\n\nPages ${curPg}-${curPg + 1}`;
        curPg += 2; // increment page number by two, since this is a spread
        curPnl = 1; // panel numbering resets every page
        prevToken = "PageToken";
      }
      if (cursor.type.name === "PanelToken") {
        scriptText +=
          prevToken === "PanelToken" || prevToken === "PageToken"
            ? "\n" + curPnl.toString()
            : curPnl.toString();
        prevToken = "PanelToken";
        curPnl++;
      }
      if (cursor.type.name === "SfxTranslation") {
        scriptText += `\tSFX:\t${this.text
          .substring(cursor.from, cursor.to)
          .trim()}\n`;
        prevToken = "";
      }
      if (cursor.type.name === "Note") {
        scriptText += `NOTE: ${this.text
          .substring(
            cursor.from + 1, // leave off the exclamation point
            cursor.to
          )
          .trim()}\n`;
        prevToken = "";
      }
      if (cursor.type.name === "Source") {
        // scriptText += `\t${this.text.substring(cursor.from, cursor.to).trim()}`;
        curSource = `${this.text.substring(cursor.from, cursor.to).trim()}`;
        curStyle = ""; // clear Style on finding Source, since specifying a Source ends Style carryover
      }
      if (cursor.type.name === "Style") {
        // scriptText += `/${this.text.substring(cursor.from, cursor.to).trim()}`;
        curStyle = `${this.text.substring(cursor.from, cursor.to).trim()}`;
      }
      if (cursor.type.name === "Content") {
        scriptText += `\t${curSource}${
          curStyle ? "/" + curStyle : ""
        }:\t${this.text.substring(cursor.from, cursor.to).trim()}\n`;
        prevToken = "";
      }
    } while (cursor.next());
    this.downloadAsText(`${id("docname").textContent} (Viz)`, scriptText);
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
