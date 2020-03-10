export default class HighlightSnippet extends HTMLElement {
  constructor(highlightColor) {
    super();
    this.style.backgroundColor = highlightColor;
  }
}

customElements.define("highlight-snippet", HighlightSnippet);
