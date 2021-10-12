import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { syntaxTree } from "@codemirror/language";
import {
  EditorView,
  Decoration,
  ViewUpdate,
  ViewPlugin,
} from "@codemirror/view";

import { Compartment } from "@codemirror/state";

import { HighlightStyle } from "@codemirror/highlight";
import { highlightStyleOptions } from "./serifu-setup.js";

import { serifu, serifuHighlighter, reparseFromField } from "./serifu-setup.js";
import { testDoc } from "./testDoc.js";
import { SerifuDoc } from "./doc.js";
import {
  SourceWidget,
  sourceLabels,
  sourceLabelsPlugin,
} from "./sourcewidget.js";

import { nodeInspector } from "./nodeinspector.js";

// this will hold our current parser
const parserDef = new Compartment();
// const highlighterDef = new Compartment();

function useNewParser(theView) {
  console.log("attempting to init new parser");
  theView.dispatch({
    effects: [parserDef.reconfigure(reparseFromField())],
  });
}

// // build a decoration list of all syntax tree nodes that need Source labels

/* Open doc and instantiate editor */
let theDoc = new SerifuDoc(testDoc);

let view = new EditorView({
  state: EditorState.create({
    doc: testDoc,
    extensions: [
      basicSetup,
      parserDef.of(serifu()),
      // serifuHighlighter,
      serifuHighlighter,
      sourceLabelsPlugin,
      nodeInspector(),
    ],
  }),
  parent: document.getElementById("editor-pane"),
  lineWrapping: true,
});

document.getElementById("reparse").addEventListener("click", () => {
  useNewParser(view);
});

document.getElementById("parserdef").value = `
@top Doc { (Page | Spread)+ }

Page {
  PageToken Panel*
}

Spread { 
  SpreadToken Panel*
}

Panel {
  PanelToken Line*
}

Line {
  (Text | Note | Sfx)
}

Sfx {
  Star SfxTranslation SfxSource? newlines
}

Note {
  NoteToken content newlines
}

Text {
  Source ("/" Style)? ":" content newlines
}

Source {
  word
}

Style {
  word
}

content {
  ( unstyledText | Bold | BoldItal | Ital | Star | Colon | DoubleStar | Underscore )* |
  BlockText
}

unstyledText {
  anyText
}


@skip { spaces }

@tokens {
  
  spaces { $[\u0009 \u000b\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]+ }
  newlines { $[\r\n\u2028\u2029]+ }

  PageToken { "#" ![\n#]* newlines}
  SpreadToken { "##" ![\n]* newlines}
  @precedence { SpreadToken, PageToken }

  PanelToken { "-" ![\n]* newlines}

  wordChar { std.asciiLetter | $[_$\u{a1}-\u{10ffff}] | std.digit | "-" | "'" | "&" | " "}
  word { (std.asciiLetter | $[\u{a1}-\u{10ffff}] | std.digit) (wordChar* (std.asciiLetter | $[\u{a1}-\u{10ffff}] | std.digit))? }

  anychar { ![\u0009:*_\u000b\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff\r\n\u2028\u2029] }
  anyText { anychar+ }

  Star { "*" }
  Bold {
    Star anychar* Star
  }

  DoubleStar { Star Star }
  BoldItal {
    DoubleStar anychar* DoubleStar
  }

  Underscore { "_" }
  Ital { Underscore anychar* Underscore }

  Colon { ":" }

  NoteToken { "!" }
  SfxTranslation { ![\n)(]+ }
  SfxSource { "(" ![\n)(]+ ")"}

  BlockText { "/=" BlockTextRest }
  BlockTextRest { ![=] BlockTextRest | "=" BlockTextAfterEquals}
  BlockTextAfterEquals { "/" | "=" BlockTextAfterEquals | ![/=] BlockTextRest }

  @precedence { BlockText, SpreadToken, PageToken, PanelToken, SfxSource, SfxTranslation, BoldItal, DoubleStar, Star, Bold, Underscore, Ital, anyText, word, spaces }
}
`;
