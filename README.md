## The Serifu Markup Language

## What it is

Serifu is a simple markup language for composing comic book scripts (in particular, translations of Japanese manga) as plain text in such a way that they may be parsed by software into a predictable and useful structure.

There are several reasons one might want to do this:

- A translator could compose all of their scripts, regardless of the client publisher, in Serifu, and let software translate it into a given publisher's style sheet prior to submission.
- Any of the considerable breadth of tools available for text editing can easily be used for Serifu.
- A specialized Serifu text editor can take advantage of the format's predictable structure to offer features like automatic page and panel numbering, character name autocomplete, and lots more. Furthermore, it's (relatively) easy to write such extensions for other text editors.
- The rigorously predictable format allows script text to be presented to the letterer or book designer in a variety of more convenient ways than a word-processing document can be.

[This is a live demo of a web-based editor](https://serifu-sketchpad.glitch.me) for Serifu-formatted files.

## The current Serifu rules

### Pages and Panels

A **page** is indicated by any line that begins with an octothorpe: `#`. Text after the `#`, e.g. `Page 3`, may be added for readability, but is ignored during parsing.

A **panel** is indicated by any line that begins with a single dash: `-`. Like to the page marker, the `-` can be followed by other text, (e.g. `3.1` to indicate "page three, panel one") for readability, but this text is not inherently meaningful (more on this later).

Whitespace at the beginning of any line is ignored, so any Serifu line may be indented however the user prefers. The examples here indent panel and dialogue lines by a single tab stop.

Not every page in a comic necessarily has text on it. It might be blank, or contain only artwork. Such pages are indicated by simply starting the next page or panel. In the following example, the second page has no text:

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

Serifu is meant to be relatively un-opinionated, but one opinion its author does hold is that page and panel numbering should be tracked automatically. Serifu's design is such that accurate page and panel numbers can be derived from the structure of the script itself, freeing the translator from entering and tracking them manually.

Text following `#` or `-` characters is meant as a convenience to make scripts more readable. As such, text after the `#` or `-` characters but _before_ the next newline is not inherently meaningful. This means that from Serifu's perspective,

```
# Page One Billion
	- 888.123
	Deunan: There's something screwy about these numbers, Bri.
# Page -666
	- 666.???
	* tick tick tick
	- π
	Deunan: They don't make sense.
# Page
	-
	Briareos: What numbers?
```

would be a valid (albeit perverse) way to describe three sequential pages, the second of which has two panels. The fanciful descriptions following the `#` an `-` characters have no meaningful effect on the script's structure.

The expectation is that well-behaved Serifu editing software will automatically insert page and panel numbers, keeping them updated as necessary when the script changes and freeing the translator or editor from the error-prone process of doing so manually.

### Script Text

#### Text Lines

Any line _not_ beginning with an `#`, `-`, `*`, or `!` is interpreted as a **Text Line**.

A Text Line consists of a Source and Content, separated by a single colon: ":".

    Ayukawa: Hmm.

Text Lines are meant to be used for any and all text in the script that's not an onomatopoetic sound effect. Character dialogue and asides, narration, captions, diegetic text appearing in the artwork itself (e.g. signs, labels, etc.) would all be represented by Text Lines.

A Text Line is meant to represent one piece of contiguous text on the page. A single word balloon, a caption, a footnote---each of these would be represented by one Text Line.

A Text Line's **Source** (notionally, the character speaking the line) is the text that precedes the colon (`:`).

A Text Line may be given an optional **Style**, which is indicated by a forward slash character after the Source, before the colon:

    Kyosuke/Excited: A-Ayukawa...!

A Text Style would typically be used to indicate an alternate font or typographical style from the way a given Text Line would normally appear.

Source and Style labels may contain spaces, and can use any alphabetic or numeric characters, but the only punctuation characters permitted are `'`, `-`, and `&`.

Different projects have different levels of specificity they require in a script, and Serifu's Source and Style fields are meant to be freeform enough to accommodate a wide variety scenarios.

Spaces or tabs immediately before or after the colon are ignored, so the following Dialogue Lines are equivalent:

    Nanako      : Oh, no!
    Nanako:Oh, no!
    Nanako:    Oh, no!

A line's content is ended by a newline character.

##### Source and Style Carryover

Comics frequently use multiple consecutive word balloons from the same speaker. For the sake of concision, once a Source has been specified, it can be omitted from subsequent lines:

    Kaz: I can't believe this.
    : I'm in a manga, now?
    : But manga is for nerds! And nobody even liked my anime!

Even though `Kaz` isn't specified in the second and third lines, Serifu will assume he's the Source for those lines.

You can also specify a Style without specifying a Source. In this case, the Source will be assumed from the previously named Source.

    Archangelo: All the right people liked it, homie.
    /Big: And they're gonna love our kick-ass manga.
    : I guarantee it!
    /Thought: At least I hope they do.

In this case, since the last three lines all omit a Source, they're attributed to `Archangelo`. The second line specifies a style of `Big`, and since the third line doesn't specify either a Source or a Style, it inherits the previous instances of each: a Source of `Archangelo`, and a Style of `Big`. The fourth line also gets the source `Archangelo`, but it specifies a new style of `Thought`.

**Note:** Once you've specified a Style, the only way return to default, unstyled text is to explicitly specify a Source again, with no Style. Following the previous example, to add a line where the Source `Archangelo` has no Style, you explictly specify `Archangelo:` again, e.g.:

    Archangelo: Even Bergdorf's carries manga, now!

This clears the Style carryover.

##### In-Line Styling and Emphasis

Within a line's contents, there are three forms of typographic emphasis available: boldface, italics, and bold italics.

Bold text is indicated with asterisks:

    Tomoko: I cannot *believe* this.

Italics are indicated with underscores:

    Tomoko: Are you _kidding_ me?

Bold italics are indicated with two asterisks:

    Mariko: It's **box-cutter time**, pal.

If a single asterisk (`*`) or underscore (`_`) is needed verbatim in the text itself, it may be included as-is, e.g.

    Footnote: *Qifrey is a licensed witch. Do not try this at home.

or

    Computer Screen: Username: major_kusanagi

A single `*` or `_` will not engage bold or italics—there must be two of a given style marker to apply the style to a piece of text. In a line like

    Lupin: I *promise* not to steal *any* of these priceless works of art!*

the words "promise" and "any" will be boldface, and the final asterisk will be interpreted as a literal asterisk.

Serifu tries to be clever enough to figure out the right thing to do when boldface and asterisks are required in close proximity, e.g.:

    Holo: I'm a wisewolf*, *not* a "dog girl", you cur!
    Margin note: *Note:** This would have been more convincing if she weren't wagging her tail.

In this example, the asterisk in `wisewolf*` is treated literally, while `*not*` is interpreted as boldface text. In the next line, `*Note:*` is bolded, with the extra asterisk after it being interpreted literally.

The current Serifu behavior is that only the outermost set of style markers are respected. So in a line like:

    Caption: *This was to be the _Excelion's_ maiden voyage.*

The outer set of `*` markers specify bolded text, and the inner `_` markers do not create italics, but are instead treated literally. This is probably not what such a line would intend, so lines like this should be avoided. (An ideal Serifu implementation would probably flag a line like this with a warning.)

It is generally preferable to avoid complicated arrangements of `*` and `_` characters. For handling cases when such arrangements are absolutely necessary, see the section below on Pre-formatted Text.

#### Sound Effects / Onomatopoeia

A sound effect translation is indicated by a line starting with a `*` character. A sound effect may have an optional transliteration in parentheses. Space between the initial `*` and the text of the sound effect is ignored.

These are all valid sound effect lines:

    *crash
    * tikka tikka
    * BOOOM (dokaaan)

#### Side Notes

A side note contains text meant to be read by someone else reading the script (e.g., the letterer or editor), but which does _not_ represent any text on the page of the comic itself, is indicated by a line beginning with "!".

    Haruhi: Look, just show me where the cryptid is and nobody gets hurt!
    ! Haruhi says ウーマー, a wasei eigo construction from the acronym "UMA," or "Unidentified Mysterious Animal." "Cryptid" is more idiomatic English.

Or

    * WOOOOOOOO!!
    ! Crowd cheering sound effect continues across all panels on page.

The `!` notation is not meant to be used for text that should be included on the page as a note to the reader. That would be better indicated by something like:

    Light: Heh... just according to _keikaku._
    Translation note: "Keikaku" means "plan."

#### Multi-line Text Blocks

As stated before, Text Lines are normally ended with a newline character. **There are two exceptions to this rule:**

It's sometimes most convenient to compose a piece of text as a multi-line section—for example, in an artist's afterword, where there are potentially multiple paragraphs of text in a straightforward, homogenous block.

While Text Lines are normally ended with a newline character, **Multi-Line Text Blocks** are one of two exceptions to this rule.

A Multi-Line Text Block is begun by immediately following the colon (`:`) after a Source with three equals signs (`===`) and a newline, and it is ended with three equals signs on a line by themselves:

```
    Sensei:===
    Afterword: My Apologies

    There are many reasons this book is late:

    * I am lazy.
    * My body is giving out
    * The life of the manga professional is composed of suffering.

    I'm truly sorry for the inconvenience I know this must cause all my readers.
    ===
```

Note that without being enclosed in `===` markers, the `Afterword: My Apologies` line would be interpreted as a Text Line with a Source of `Afterword` and a Text of `My Apologies`, and the lines beginning with asterisks, like `* I am lazy.` would be interpreted as sound effects. However, within a Multi-line Text Block, other syntax is superceded until the block is ended with a `===` marker on a line by itself.

The `*bold*`, `_italic_`, and `**bold italic**` formatting rules work in Multi-Line Text Blocks the same way they do in Text Lines.

#### Pre-formatted Text

**Pre-formatted Text** is the other exception to the "one Line per line" rule.

Immediately following a Text Line's Source with a forward slash and an equals sign (`/=`) begins a pre-formatted text block. This is useful for composing translations where every character must be included verbatim. An equals sign followed by a forward slash (`=/`) ends the block. For example, in the unlikely case that you needed to represent Serifu-formatted text literally on a page, something like this would work:

    Computer Screen: /=
    	# Page 3
    	- 3.1
    	Caption: Serifu Syntax is easy!
    	Caption: You can even do _italics_ and *boldface!*
    =/

This indicates that every single character between the `/=` `=/` marks is meant to be included exactly as written.

Any text between `/=` `=/` tokens is interpreted verbatim, so the `*`, `_`, and `**` tokens for indicating boldface and italics do not work within them, and will always be included literally.

**Note:** An important distinction between Multiline Text Blocks and Pre-formatted Text is that Multiline Text Blocks _must_ take up multiple lines of text, since the ending `===` marker must be on a line by itself. Pre-formatted Text, however, can remain on a single line:

    Computer Screen: /= *Bingo.* =/

### Future-Proofing

Backticks (```) currently have no special meaning in Serifu. However, placing text between backticks may eventually be used as a way to mark words or phrases as special terminology—i.e., terms that the parser can identify to include on an automatically-generated style sheet. The backticks themselves would not be present in the lettered text. For future compatibility, the Serifu author recommends avoiding using backticks in scripts.

## The Reasoning Behind Sources and Styles

Serifu is a set of deliberately minimal conventions for specifying the text that is meant to appear on a page of sequential art.

Arguably, the order of Pages, Panels, and Lines alone should be enough for a letterer to understand which pieces of text go where. Specifying which character is speaking, however, adds another piece of information that the letterer can use to infer text placement. This also makes the script considerably more readable as a standalone document.

Associating lines of text with the characters speaking them also allows scripts to be treated as data in a way conventional word processing documents can't be. With Serifu, it's trivial to constraint a search to lines only spoke by a particular character, which can be very useful during the translation or editorial processes of long series. The information in a Serifu document can also easily be the beginning of an automatically generated stylesheet.

A letterer's job is to place the text in art, and for every piece of text they place, a question must be answered: "What kind of text is this?" Serifu's Sources and Styles are meant to make it easy for the script writer or translator to answer this question ahead of time.

The notional goal is this: When a letterer loads a Serifu document into their design software, they will have a way to associate Sources and Styles specified in the script with design parameters (fonts, weights, sizes, etc) appropriate for the comic's presentation. Then whenever a piece of text with a given Serifu Style is placed, it will automatically be given the appropriate font, etc.

This means that the Serifu Style of e.g. `/Thought` can be associated with e.g. 14pt WildWords Italics, and once this association is created, _every_ text line with a `/Thought` Style will automatically be set in 14pt WildWords Italics. This, along with the automatic text placement Serifu enables, removes much of the repetitive gruntwork involved in lettering, leaving the letterer more time to focus on the aspects of their work that require human judgement and taste.

## Etc.

The markup rules described in this document are not yet set in stone, and there is still latitude for adjustment. If you are a comics writer, manga translator, letterer, or editor, and you have feedback or thoughts on Serifu, please feel free to get in touch.
