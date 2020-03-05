export default class Highlight extends HTMLElement {
  constructor(highlightColor) {
    super();
    this.style.backgroundColor = highlightColor;
  }
}

customElements.define("highlight-snippet", Highlight);
