/* eslint-disable no-param-reassign */
import chroma from 'chroma-js';
import { getSnippetsByDataId } from '../../util/dom';

class HighlightSnippet extends HTMLElement {
  constructor(color, uuid) {
    super();
    this.color = color;
    this.id = uuid;
  }

  connectedCallback() {
    this.style.backgroundColor = this.color;
    this.setAttribute('data-highlight-id', this.id);

    this.onmouseenter = e => {
      getSnippetsByDataId(e.target.dataset.highlightId).forEach(s => {
        s.style.backgroundColor = chroma(s.style.backgroundColor)
          .darken(0.3)
          .hex();
      });
    };

    this.onmouseout = e => {
      getSnippetsByDataId(e.target.dataset.highlightId).forEach(s => {
        s.style.backgroundColor = this.color;
      });
    };
  }
}

export function defineHighlightSnippet() {
  customElements.define('highlight-snippet', HighlightSnippet);
}
