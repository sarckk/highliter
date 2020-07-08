class HighlightSnippet extends HTMLElement {
  constructor(id, highlightColor, hoverColor) {
    super();
    this.setAttribute('data-highlight-id', id);
    this.classList.add('highlight-snippet');
    this.style = `
      --snippet-highlight-color: ${highlightColor};
      --snippet-hover-color: ${hoverColor};
    `;
  }
}

export function prepareHighlightSnippet() {
  customElements.define('highlight-snippet', HighlightSnippet);
}
