/* sourcewidget.js contains the definitions for the source-coloring label
 specifically implemented with
codemirror's libraries (as opposed to extra-editor UI in sidebars, etc.)
*/

import {
  WidgetType,
  EditorView,
  Decoration,
  ViewUpdate,
  ViewPlugin,
  DecorationSet,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

// my silly string -> RGB hash function
function hashStringToRGB(str) {
  function hashChar(char) {
    let seed = char.charCodeAt(0);
    let xor1 = seed * Math.E * 1e11;
    let xor2 = seed * Math.PI * 1e11;
    let munge = Math.abs(seed ^ xor1 ^ (seed ^ xor2));
    return munge % 256;
  }
  let rgb = [0, 0, 0];
  for (let i = 0; i < str.length; i++) {
    let gchar = String.fromCharCode(Math.floor(str.charCodeAt(i) * 1.5));
    let bchar = String.fromCharCode(Math.floor(str.charCodeAt(i) * 1.8));
    rgb[0] = rgb[0] ^ hashChar(str.charAt(i));
    rgb[1] = rgb[1] ^ hashChar(gchar);
    rgb[2] = rgb[2] ^ hashChar(bchar);
  }
  return rgb;
}

// a string -> HSL hash function that produces more nicely vivid output
function hashStringToHSL(str) {
  function hashChar(char) {
    let seed = char.charCodeAt(0);
    let xor1 = seed * Math.E * 1e11;
    let xor2 = seed * Math.PI * 1e11;
    let munge = Math.abs(seed ^ xor1 ^ (seed ^ xor2));
    return munge; // % 360;
  }
  let h = 0;
  let s = 0;
  let l = 0;
  for (let i = 0; i < str.length; i++) {
    h = h ^ hashChar(str.charAt(i));
  }
  // we're going to derive saturation by taking the mod 100 of our h hash value
  // and pseudo-normalizing that on a scale of 50-100, and the l on a scale of  40 - 73
  s = Math.floor((h % 100) / 2 + 50);
  l = Math.floor((h % 100) / 3 + 40);
  return `hsl(${h % 360}, ${s}%, ${l}%)`;
}

export class SourceWidget extends WidgetType {
  constructor(str) {
    super(); // call this first!!!
    // string -> RGB hash function
    this.sourceName = str;
    //    this.defaultRGB = hashStringToRGB(str);
    this.defaultHSL = hashStringToHSL(str);
  }

  // if there's already an equivalent widget where we're applying this one,
  // this method gets called to check if it's equivalent to this one, in which
  // case it's reused
  eq(other) {
    return other.sourceName === this.sourceName;
  }
  // generate the <span> tags that will surround our Source, along with the appropriate CSS classes
  // and our computed RGB value
  toDOM() {
    let wrap = document.createElement("span");
    //let rgb = hashStringToRGB(this.sourceName); // compute a color hash for this Source

    wrap.setAttribute("aria-hidden", "true"); // hide widget from screen readers; it won't be useful to them
    wrap.className += `cm-source-label`; // give it the generic classname
    wrap.className += ` cm-source-label-${this.sourceName}`; // give it a predictable class name we can use elsewhere if necessary, along with the base cm-source-label class
    //    wrap.style.backgroundColor = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
    wrap.style.backgroundColor = hashStringToHSL(this.sourceName);

    return wrap;
  }
  ignoreEvent() {
    return false;
  }
}

// build a decoration list of all syntax tree nodes that need Source labels
export function sourceLabels(view) {
  let widgets = [];
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from: from,
      to: to,
      enter: (type, from, to) => {
        if (type.name === "Source") {
          // when we find a Source node
          let theName = view.state.doc.sliceString(from, to);
          // console.log(`SOURCE NODE??? ${theName}`);
          let deco = Decoration.widget({
            widget: new SourceWidget(theName),
            side: 0,
          });
          widgets.push(deco.range(from));
        }
      },
    });
  }
  return Decoration.set(widgets);
}

// make view plugin to update Source labels
export const sourceLabelsPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      console.log("instantiating anonymous SourceLabels Plugin Class");
      this.decorations = sourceLabels(view);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        // console.log("updating view with new labels");
        return (this.decorations = sourceLabels(update.view));
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
