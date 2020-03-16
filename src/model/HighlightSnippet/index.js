/* eslint-disable no-param-reassign */
import chroma from 'chroma-js';
import { getSnippetsByDataId } from '../../util/dom';

class HighlightSnippet extends HTMLElement {
  constructor(highlightColor, uuid) {
    super();
    this.style.backgroundColor = highlightColor;
    this.setAttribute('data-highlight-id', uuid);

    this.onmouseenter = e => {
      getSnippetsByDataId(e.target.dataset.highlightId).forEach(s => {
        s.style.backgroundColor = chroma(s.style.backgroundColor)
          .darken(0.3)
          .hex();
      });
    };

    this.onmouseout = e => {
      getSnippetsByDataId(e.target.dataset.highlightId).forEach(s => {
        s.style.backgroundColor = highlightColor;
      });
    };
  }
}

export function defineHighlightSnippet() {
  customElements.define('highlight-snippet', HighlightSnippet);
}
