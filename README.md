# _underscore

Sometimes it's good to re-invent the wheel (or at least part of it).

**underscore** is my attempt to understand the [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection).
It's essentially like Tim Down's [rangy](https://github.com/timdown/rangy) libary, except shittier 💩.

Here's a list of things it can do:
- Position highlight window at the appropriate position after the user has made a highlight, like [Weava Highlighter](https://chrome.google.com/webstore/detail/weava-highlighter-pdf-web/cbnaodkpfinfiipjblikofhlhlcickei?hl=en)
- Intelligently pick out highlighted DOM elements in presence of whitespace and null nodes
- Wrap highlighted parts in a custom html element
- Store highlights in JSON format in localStorage
- Deserialize JSON on page load to retrieve highlights for a certain page

The library is experimental in nature, and is not recommended for use in a production environment. 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

