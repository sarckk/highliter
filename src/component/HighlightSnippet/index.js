class HighlightSnippet extends HTMLElement {
  constructor(id, highlightColor, hoverColor) {
    super();
    this.id = id;
    this.highlightColor = highlightColor;
    this.hoverColor = hoverColor;
    this.setAttribute('data-highlight-id', id);
  }

  connectedCallback() {
    this.setCSSVars(this.highlightColor, this.hoverColor);
  }

  setCSSVars(highlightColor, hoverColor) {
    this.style = `
      --snippet-highlight-color: ${highlightColor};
      --snippet-hover-color: ${hoverColor};
    `;
  }
}

export function prepareHighlightSnippet(options) {
  customElements.define(options.snippetTagName, HighlightSnippet);
}
