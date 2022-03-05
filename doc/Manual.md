# An Introduction

Serifu is a plain text markup language, and as such it can be written using any text editor the user prefers. The Serifu editor is designed to make composing documents in the Serifu markup language especially quick and pleasant, but it is by—design—not the only way to compose Serifu markup.

At its core, the Serifu editor is just a text editor. By and large, it works the way we expect text editors to work: There's a cursor. When you type, text appears at the cursor. You can copy, cut, and paste the same way you would in any other app.

But since the Serifu editor knows the rules of its own markup language, it can do things like color and decorate certain parts of the text to set them apart, create lists of characters and styles that appear in the script, and build a visualization of the script's structure.

Regardless of the Serifu editor's functionality, it's important to remember that Serifu documents are always only ever plain text.

# Disclaimer

[This the beta version of the Serifu editor](https://serifu-sketchpad.glitch.me). If there's something about it that needs to change, please tell me.

If you don't like the way the editor looks—the color choices, the way pages, panels, and lines are displayed, etc.—please let me know. The editor's appearance will eventually be highly customizable, but the default settings should ideally be appealing and useful.

# How to compose with Serifu

## Entering Text Lines

Fundamentally, the way to use Serifu is to type Serifu markup into the editor window. By default, a new "blank" document begins with the first Page and Panel already in the editor.

![Editor screenshot 1 here](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/1.png)

Let's try typing a line of dialogue. Something like...

> Genji: Well, here I am.

![Animation of typing that](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/1%20Typing%20First%20Line.sm.gif)

"Genji" is this line's Source. As you type the line's source, you'll notice a colored label appear next to it, and that the color changes as you type. The Serifu editor picks a unique color for every Source in the document; if you change the name of the Source, the color will also change. This is to help make it visually clearer which Sources are present in a given section of the script.

The source name "Genji" will appear in the editor's left sidebar, and a line indicator will appear in the minimap's display for page 1:

![Editor screenshot 2 here](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/2.png)

## Autocomplete

When you start the next line, if the Source you've started typing is similar to a Source that's previously appeared in the document, the Autocomplete menu will appear. You can just keep typing to finish entering the Source, but you can also use the up and down arrow keys to select an Autocomplete option, and then type `return` to select it. It will be automatically inserted in the script.

![Animation of autocomplete selection](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/2%20Autocomplete%20Selection.sm.gif)

## Styles

Styles are optional labels that mean the text associated with them is different from the default in some way. They usually indicate that a non-default font will be needed, e.g. because a character is whispering or yelling, etc.

A Style is separated from its Source by a `/`:

> Genji/Bold: Main character in the world's first novel!

![Animation of Style typing](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/3%20Style%20Entry.sm.gif)

Styles also have an autocomplete menu, which works the same way that the Source autocomplete menu does.

## Two kinds of shortcuts

In order to save as much repetitive typing as possible, Serifu has some shortcut features in addition to its autocomplete.

Typing `Ctrl-D` (`Cmd-D` on macOS) automatically creates a new line with the same Source and Style as the previous line:

![Animation of Cmd-D](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/4%20Ctrl-D%20Shortcut.sm.gif)

Additionally, Source and Style carryover are built into the Serifu language. Once you've entered a Source, you don't have to enter it again until it changes:

![Editor screenshot 3 here](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/3.png)

For the detailed rules of how Source and Style carryover work, see their section in the [full description of Serifu's syntax](https://github.com/papatangosierra/serifu#readme).

## Sound Effects

Anything on a line starting with an asterisk (`*`) is a sound effect. Sound effects can have optional transliterations, which are in parenthesis.

![Editor screenshot 4 here](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/4.png)

Note that this arrangement is the opposite of e.g. Yen Press's formatting convention, which gives the SFX transliteration first and the translation in parenthesis.

## Notes

Anything on a line starting with an exclamation mark (`!`) is a Note. Notes do not contain layout text, but are rather used to give clarifying information to someone else reading the script, like an editor or letterer.

![Editor screenshot 5 here](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/5.png)

## Panels

Lines starting with a hyphen character (`-`) mark the start of a Panel. If you type a `-` and then `return`, Serifu will automatically insert the correct sequential numbering.

![Animation of panel entering](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/5%20Panel%20Entry.sm.gif)

If you insert a panel before an existing panel, then press `return`, Serifu will automatically renumber the following panels:

![Animation of panel renumbering](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/6%20Panel%20Renumbering.sm.gif)

You can also use the keyboard shortcut `Ctrl-return` (`Cmd-return` on macOS) to insert the next sequentially numbered-panel.

![Animation of panel entry shortcut](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/8%20Panel%20Entry%20Shortcut.sm.gif)

## Pages and Spreads

Lines starting with one or two octothorpe charaters (`#` and `##`) mark the start of Pages and Spreads, respectively. As with Panels, entering one of these characters and pressing `return` will automatically insert the text "Page" along with the number of the page.

![Animation of page entering](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/7%20Page%20Entry.sm.gif)
![Animation of spread entering](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/7a%20Spread%20Entry.sm.gif)

You can also use the keyboard shortcut `Ctrl-shift-return` (`Cmd-shift-return` on macOS) to insert the next sequentially numbered page _and_ panel.

![Animation of page entry shortcut](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/9%20Page%20Entry%20Shortcut.sm.gif)

# Saving and Exporting

Although it runs in your web browser, Serifu does not store any data on a server. As you compose a script, it automatically saves your progress to local browser storage every ten seconds. You can also trigger a manual save by clicking the `Save` button underneath the script title near the top-left corner.

Serifu has three "save slots" that you can use to have multiple scripts open. This is a mostly fanciful feature, but perhaps you'll find it useful. Save slots can be renamed.

![Animation of save slot renaming](https://raw.githubusercontent.com/papatangosierra/serifu/main/doc/img/9a%20Save%20Slot%20Renaming.sm.gif)

Local browser storage is preserved even if you quit the browser, or it crashes, so work in progress should be relatively safe.

**Note:** If you open Serifu using your browser's "incognito" or "private browsing" mode, local storage will _not_ be preserved.

You can generate a download of the current script by clicking the `Download Text` button, and the script will be saved wherever your browser saves downloaded files.

**Important:** I _do not recommend_ relying on Serifu's save mechanism. Between work sessions, you should keep an external copy of your script outside of Serifu, either by copy-pasting the text into a different app, or by using the `Download Text` button.

## Paranoia Mode

In the left sidebar, there is a checkbox labelled `Paranoia Mode`. If you click this checkbox to enable Paranoia Mode, Serifu will automatically download a copy of your current script every five minutes. I highly recommend working with Paranoia Mode **on** for a while, to make sure Serifu isn't likely to crash on your system.

## Exporting

While the author's hope is that eventually everyone will simply accept Serifu-formatted comic scripts, in the meantime, Serifu can export to the formatting guidelines of several publishers, and if you want to use Serifu but a necessary export format isn't available, I'll try to add it as quickly as I can.

Currently supported export formats:

- Viz
- Kodansha
- Yen Press/Square Enix

Seven Seas is coming soon. Other formats can be added; please get in touch if you need something different.

These exports currently generate plain text files, which will need to be pasted into a word processor (Google Docs, Microsoft Word, etc) to prepare the type of files most publishers expect. The Viz and Kodansha script formats use tab-separated columns, and to make the exported text look correct, you will probably have to adjust the tab stops slightly after pasting the text into your word processing software.
