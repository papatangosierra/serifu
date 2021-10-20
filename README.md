## The Serifu Markup Language

## What it is

Serifu is a simple markup language for composing comic book scripts (in particular, translations of Japanese manga) as plain text in such a way that they may be parsed by software into a predictable and useful structure.

There are several reasons one might want to do this:

- A translator could compose all of their scripts, regardless of the client publisher, in Serifu, and let software translate it into a given publisher's style sheet prior to submission.
- Any of the considerable breadth of tools available for text editing can easily be used for Serifu.
- A specialized Serifu text editor--coming soon--can take advantage of the format's predictable structure to offer features like automatic page and panel numbering, character name autocomplete, and lots more.
- The rigorously predictable format allows script text to be presented to the letterer or book designer in a variety of more convenient ways than a word-processing document can be.

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

A Text Line may be given an optional **Style**, which is indicated by a forward slash character after the Source, before the colon:

    	Kyosuke/Excited: A-Ayukawa...!

A Text Style would typically be used to indicate an alternate font or typographical style from the way a given Text Line would normally appear.

Different projects have different levels of specificity they require in a script, and Serifu's Source and Style fields are meant to be freeform enough to accommodate a wide variety of editorial needs.

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

    	Mariko: It's **box-cutter time**, pal.

The bold, italics, and bold italics notations should not be combined or nested.

If a single asterisk (`*`) or underscore (`_`) is needed verbatim in the text itself, they may be included as-is, e.g.

        Footnote: *Qifrey is a licensed witch. Do not try this at home.

or

        Computer Screen: Username: major_kusanagi

A single `*` or `_` will not engage bold or italics—there must be two of a given style marker to apply the style to a piece of text. In the case of odd numbers of markers, pairs are assembled starting with the first marker, so in a line like

        Lupin: I *promise* not to steal *any* of these priceless works of art!*

the words "promise" and "any" will be boldface, and the final asterisk will be interpreted as a literal asterisk.

If more complicated arrangements of special characters are necessary, see the section below on pre-formatted text blocks.

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

#### Pre-formatted Text Blocks

As stated before, Text Lines are normally ended with a newline character. **There is one exception to this rule:** Immediately following a Text Line's Source with a forward slash and an equals sign (`/=`) begins a pre-formatted text block. This is useful for composing translations where formatting like newlines and tabs are important--signs, menus, documents, etc. An equals sign followed by a forward slash (`=/`) ends the block.

        Sign:/=
    Menu:
    - Pizza: 50 Yen
    - Okonomiyaki: 100 Yen
    - Beer: 200 Yen
    =/

Note that without the being enclosed by the `/=` `=/` markers, the `Menu:` would be interpreted as a line with a Source called `Menu` but with no Content, while the three lines beneath it would be interpreted as new panels, since they both begin with `-`. Placing all this text between `/=` `=/` marks ensures that all four lines are included as the Content for the `Sign` Text Line.

The opening `/=` marker must immediately follow its Source, without any spaces.

Any text between `/=` `=/` tokens is interpreted verbatim, so the `*`, `_`, and `**` tokens for indicating boldface and italics do not apply there.

If a line requires multiple underscores or asterisks to be represented literally, a one-line Text Block is the best way to accomplish this:

        Contract Text:/= The undersigned* agrees to sell his soul** for a thousand berries.***=/

## Etc.

The markup rules described in this document are not yet set in stone, and there is still latitude for adjustment. **If you are a comics writer, manga translator, letterer, or editor, and you have feedback or thoughts on Serifu, please feel free to get in touch.**
