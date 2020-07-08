# \_underscore

Sometimes it's good to re-invent the wheel (or at least part of it).

**underscore** was born out of my attempt to understand the [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection).

I took a lot of inspiration from [alienzhou](https://github.com/alienzhou)'s [web-highlighter](https://github.com/alienzhou/web-highlighter) library, and large potions of the code is directly modelled after his code. However, there are some differences in
the underlying implementation (look at `getHighlightRanges()` in `src/util/dom.js` for example) which (the author contends) has resulted in increased readability and simplicity in some parts of the code. The main aspects which differentiate **underscore** are:

1. it comes with a `highlight-menu` web-component which displays whenever the user has selected a new range (positioning of the menu depends on the direction of the selection). Users can opt out of this.
2. it uses `TreeWalker` to retrieve the list of text nodes which overlap the selected range
3. it fixes a minor implementation error in [web-highlighter](https://github.com/alienzhou/web-highlighter) in which an incorrect range is restored if the absolute offset of the saved range (relative to its parent element) is 0 (see the comment [here](https://github.com/sarckk/underscore/blob/5cc05a20a5c891985b57ebb2777cf596edb6c7be/src/util/dom.js#L166) for details)
4. ...but offers less customizability compared to [web-highlighter](https://github.com/alienzhou/web-highlighter)

The library can be thought of as an experimental work, and has no test coverage. It is not recommended for use in a production environment.
