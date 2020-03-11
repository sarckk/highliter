class HighlightSnippet extends HTMLElement {
  constructor(highlightColor) {
    super();
    this.style.backgroundColor = highlightColor;
  }
}

export function defineHighlightSnippet() {
  customElements.define('highlight-snippet', HighlightSnippet);
}
