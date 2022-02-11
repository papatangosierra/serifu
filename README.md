## The Serifu Markup Language

## What it is

Serifu is a simple markup language for composing comic book scripts (in particular, translations of Japanese manga) as plain text in such a way that they may be parsed by software into a predictable and useful structure.

There are several reasons one might want to do this:

- A translator could compose all of their scripts, regardless of the client publisher, in Serifu, and let software translate it into a given publisher's style sheet prior to submission.
- Any of the considerable breadth of tools available for text editing can easily be used for Serifu.
- A specialized Serifu text editor--coming soon--can take advantage of the format's predictable structure to offer features like automatic page and panel numbering, character name autocomplete, and lots more.
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

Serifu is meant to be relatively un-opinionated, but one opinion its author does hold is that page and panel numbering should be tracked automatically. The structure of Serifu is such that accurate page and panel numbers can be derived at parse time, freeing the translator from entering and tracking them manually.

Text following `#` or `-` characters is meant as a convenience to make scripts more readable. As such, text after the `#` or `-` characters but _before_ the next newline is not inherently meaningful. This means that from Serifu's perspective,

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

would be a valid (albeit perverse) way to describe three sequential pages, the second of which has two panels.

The expectation is that well-behaved Serifu editing software will automatically insert page and panel numbers, keeping them updated as necessary when the script changes and freeing the translator or editor from the error-prone process of doing so manually.

### Script Text

#### Text Lines

Any line _not_ beginning with an `#`, `-`, `*`, or `!` is interpreted as a **Text Line**.

A Text Line consists of a Source and Content, separated by a single colon: ":".

    		Ayukawa: Hmm.

Text Lines are meant to be used for any and all text in the script that's not an onomatopoetic sound effect. Character dialogue and asides, narration, captions, diegetic text appearing in the artwork itself (e.g. signs, labels, etc.) would all be represented by Text Lines.

A Text Line is meant to represent one piece of contiguous text on the page. A single word balloon, a caption, a footnote---all of these would be represented by a Text Line.

A Text Line may be given an optional **Style**, which is indicated by a forward slash character after the Source, before the colon:

    		Kyosuke/Excited: A-Ayukawa...!

A Text Style would typically be used to indicate an alternate font or typographical style from the way a given Text Line would normally appear.

Different projects have different levels of specificity they require in a script, and Serifu's Source and Style fields are meant to be freeform enough to accommodate a wide variety of editorial needs.

Spaces or tabs immediately before or after the colon are ignored, so the following Dialogue Lines are equivalent:

    		Nanako      : Oh, no!
    		Nanako:Oh, no!
    		Nanako:    Oh, no!

A line's contents are ended by a newline character.

Comics frequently use multiple consecutive word balloons from the same speaker. For the sake of concision, once a Source has been specified, it can be omitted from subsequent lines:

    		Kaz: I can't believe this.
    		: I'm in a manga, now?
    		: But manga is for nerds! And nobody even liked my anime!

Even though `Kaz` isn't specified in the second and third lines, Serifu will assume he's the Source for those lines.

You can also specify a Style without specifying a Source:

    		Archangelo: All the right people liked it, homie.
    		/Big: And they're gonna love our kick-ass manga.
    		: I guarantee it!
    		/Thought: At least I hope they do.

In this case, since the last three lines all omit a Source, they're attributed to `Archangelo`. The second line specifies a style of `Big`, and since the third line doesn't specify either a Source or a Style, it inherits the previous instances of each: a Source of `Archangelo`, and a Style of `Big`. The fourth line also gets the source `Archangelo`, but it specifies a new style of `Thought`.

Within a line's contents, there are three forms of typographic emphasis available: boldface, italics, and bold italics.

Bold text is indicated with asterisks:

    		Tomoko: I cannot *believe* this.

Italics are indicated with underscores:

    		Tomoko: Are you _kidding_ me?

Bold italics are indicated with two asterisks:

    		Mariko: It's **box-cutter time**, pal.

The bold, italics, and bold italics notations should not be combined or nested.

If a single asterisk (`*`) or underscore (`_`) is needed verbatim in the text itself, they may be included as-is, e.g.

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

If more complicated arrangements of special characters are necessary, see the section below on Pre-formatted Text.

#### Sound Effects / Onomatopoeia

A sound effect translation is indicated by a line starting with a `*` character. A sound effect may have an optional transliteration in parentheses. Space between the initial `*` and the text of the sound effect is ignored.

These are all valid sound effect lines:

        *crash
        * tikka tikka
        * BOOOM (dokaaan)

#### Side Notes

A side note contains text for the benefit of someone else reading the script (e.g., the letterer or editor), but which does _not_ represent any text on the page of the comic itself, is indicated by a line beginning with "!".

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

While Text Lines are normally ended with a newline character, Multi-Line Text Blocks are one of two exceptions to this rule.

A Multi-Line Text Block is begun by immediately following the colon (`:`) after a Source with three equals signs (`===`) and a newline, and it is ended with three equals signs on a line by themselves:

    		Sensei:===
    		Afterword: My Apologies
    		There are many reasons this book is late:
    		* I am lazy.
    		* My body is giving out
    		* The life of the manga professional is composed of suffering.
    		I'm truly sorry for the inconvenience I know this must cause all my readers.
    		===

Note that without being enclosed in `===` markers, the `Afterword: My Apologies` line would be interpreted as a Text Line with a Source of `Afterword` and a Text of `My Apologies`, and the lines beginning with asterisks, like `* I am lazy.` would be interpreted as sound effects. However, within a Multi-line Text Block, other syntax is superceded until the block is ended with a `===` marker on a line by itself.

The `*bold*`, `_italic_`, and `**bold italic**` formatting rules work in Multi-Line Text Blocks the same way they do in Text Lines.

#### Pre-formatted Text

Pre-formatted Text is the other exception to the "one Line per line" rule.

Immediately following a Text Line's Source with a forward slash and an equals sign (`/=`) begins a pre-formatted text block. This is useful for composing translations where every character must be included verbatim. An equals sign followed by a forward slash (`=/`) ends the block. For example, in the unlikely case that you needed to represent Serifu-formatted text literally on a page, something like this would work:

      Computer Screen: /=
    		# Page 3
    		- 3.1
    		Caption: Serifu Syntax is easy!
    		Caption: You can even do _italics_ and *boldface!*
    	=/

This indicates that every single character between the `/=` `=/` marks is meant to be included exactly as written.

Any text between `/=` `=/` tokens is interpreted verbatim, so the `*`, `_`, and `**` tokens for indicating boldface and italics do not work within them, and will always be included literally.

_Note:_ An important distinction between Multiline Text Blocks and Pre-formatted Text is that Multiline Text Blocks must take up multiple lines of text, since the ending `===` marker _must_ be on a line by itself. Pre-formatted Text, however, can remain on a single line:

    			Computer Screen: /= *Bingo.* =/

## Etc.

The markup rules described in this document are not yet set in stone, and there is still latitude for adjustment. If you are a comics writer, manga translator, letterer, or editor, and you have feedback or thoughts on Serifu, please feel free to get in touch.
