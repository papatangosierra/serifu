# The Serifu Markup Language

## What it is

Serifu is a simple markup language for composing comic book scripts (in particular, translations of Japanese manga) as plain text in such a way that they may be parsed by software into a predictable and useful structure.

There are several reasons one might want to do this:

- A translator can compose all of their scripts, regardless of the client publisher, in Serifu, and let software translate it into a given publisher's style sheet prior to submission.
- Any of the considerable breadth of tools available for text editing can easily be used for Serifu.
- A specialized Serifu text editor--coming soon--can take advantage of the predictable structure to offer features like automatic page and panel numbering, character name autocomplete, and lots more.
- The rigorously predictable format allows script text to be presented to the letterer or book designer in a variety of vastly more conveninent ways than a word processing document.

## The Serifu Roadmap

I am currently working on a Javascript-based parser for the Serifu language, which I will first be integrating into a web-based editor. I'm using Marijn Haverbeke's [Lezer](https://lezer.codemirror.net) to implement the parser, and [CodeMirror](https://codemirror.net/6/) to build the editor.

Once the parser and editor are approximately duplicating the functionality of [my first attempt at Serifu](https://serifu-prototype.glitch.me), I will move on to a rewrite of [the InDesign extension](https://www.youtube.com/watch?v=yGyYkDYovlY) that enables automatic sequential text placement of script lines, which is one of the main raisons d'être of this project.

## The current Serifu rules

A new page is indicated by any line that begins with an octothorpe: `#`. Text after the `#`, e.g. `Page 3`, may be added for readability, but is ignored during parsing.

A new panel is indicated by any line that begins with a single dash: `-`. Like to the page marker, the `-` can be followed by other text, (e.g. `3.1` to indicate "page three, panel one") for readability, but this text is ignored by the parser.

Whitespace at the beginning of any line is ignored, so any Serifu line may be indented however the user prefers. The examples here indent panel and dialogue lines by a single tab stop.

Blank pages and lines are indicated by simply starting the next page or panel. In the following example, the middle of the three pages is blank:

    # PAGE 1
    	- 1.1
    	Title: Ranma 1/2
    # PAGE 2
    # PAGE 3
    	- 3.1
    	Ranma: I ain't nobody's picnic!

When two facing pages (i.e., a spread) function as one continuous layout, this is indicated by using two consecutive octothorpes: `##`.

    ## PAGES 112-113
    	- 112-113.1
    	Goku: ...Haaaaaaaaa!!!

As with pages, blank panels are marked by simply starting the next panel. In this example, the second panel is blank:

    # PAGE 9
    	- 9.1
    	Belldandy: Hello, this is the Goddess Help Service.
    	- 9.2
    	- 9.3
    	Keiichi: Hi, do you have such as a way to deal with real bad senpais.

Because text after the `-` or `#` characters but _before_ the next newline is ignored, the expectation is that well-behaved Serifu editing software will automatically place appropriate page and panel number labels there, updating them as necessary as the script changes and freeing the translator from the need to do so manually.

Blank lines are ignored.

A sound effect translation is indicated by a line starting with a `*` character. A sound effect may have an optional transliteration in parentheses. Space between the initial `*` and the text of the sound effect is ignored.

    	*crash
    	* tikka tikka
    	* BOOOM (dokaaan)

An editorial note meant to clarify something for the benefit of the letterer or editor, but which does not represent any text on the page, is indicated by a line beginning with "!".

    	Haruhi: Look, just show me where the cryptid is and nobody gets hurt!
    	! Haruhi says ウーマー, a wasei eigo construction from the acronym "UMA," or "Unidentified Mysterious Animal." "Cryptid" is more idiomatic English.

The `!` notation is _not_ meant to be used for text that should be included on the page as a note to the reader. That would be better indicated by something like:

    	Light: Heh... just according to _keikaku._
    	Translation note: "Keikaku" means "plan."

Customarily, a note is meant to apply to the line or SFX immediately before it.

Any line _not_ beginning with an `#`, `-`, `*`, or `!` is interpreted as a Dialogue Line.

A Dialogue Line must have a Speaker and Text, separated by a single colon: ":".

    	Ayukawa: Hmm.

A Dialogue Line may be given an optional style, which is indicated by a forward slash character after the Speaker, before the colon:

    	Kyosuke/Excited: A-Ayukawa...!

A dialogue style is meant to indicate e.g. an alternate font or typographical style. Different publishers have different levels of specificity they require, and Serifu's dialogue style field is meant to be open and un-opinionated enough to accommodate a wide variety of editorial needs.

Spaces or tabs immediately before or after the colon are ignored, so the following Dialogue Lines are equivalent:

    	Nanako      : Oh, no!
    	Nanako:Oh, no!
    	Nanako:    Oh, no!

A line's contents are ended by a newline character.

Within a line's contents, there are three forms of typographic emphasis available: boldface, italics, and bold italics.

Bold text is indicated with asterisks:

    	Tomoko: I cannot *believe* this.

Italics are indicated with underscores:

    	Tomoko: Are you _kidding_ me?

Bold italics are indicated with two asterisks:

    	Tomoko: I **swear to god**, Nanako.

Note that these are mutually exclusive and cannot be nested, i.e. you **should not** specify bold italics by combining the bold and italics tokens:

    	Mariko: It's _*box-cutter time*_, pal!

This limitation is meant to reflect the reality that not every combination of bold and italic variants is available in every font a letterer might use, and

As stated before, Dialogue Lines are ended with a newline character. **There is one one exception to this rule:** Three equals signs (`===`) immediately after the colon begins a preformatted section. This is useful for composing translations where formatting like newlines and tabs are important--signs, menus, documents, etc. Three equals signs on a line by themselves ends the preformatted section:

    Sign:===
    Menu:
    - Pizza: 50 Yen
    - Okonomiyaki: 100 Yen
    - Beer: 200 Yen
    ===

Note that without the `===` tokens, the `Menu:` would be interpreted as a line with a speaker named `Menu` but with no content, and two lines beneath it would be interpreted as new panels, since they both begin with `-`. Placing all this text between `===` marks ensures that it's included verbatim in the `Sign` line.

Because any text between `===` tokens is interpreted verbatim, the `*`, `_`, and `**` tokens for indicating boldface and italics do not apply there.
