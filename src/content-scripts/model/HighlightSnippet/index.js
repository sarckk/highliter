class HighlightSnippet extends HTMLElement {
  constructor(color, id) {
    super();
    this.color = color;
    this.setAttribute('data-highlight-id', id);
    this.classList.add('highlight-snippet');
    this.classList.add(`highlight-${this.color}`);
  }
}

export function defineHighlightSnippet() {
  customElements.define('highlight-snippet', HighlightSnippet);
}
