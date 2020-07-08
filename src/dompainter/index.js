import { getHighlightRanges } from '../util/selection';
import {
  getCommonEnclosingElement,
  getElemByTag,
  absToRelativeOffset
} from '../util/dom';
import { initDefaultSnippetStyles } from './styles';

export default class DOMPainter {
  constructor(highlightColor, hoverColor) {
    this.highlightColor = highlightColor;
    this.hoverColor = hoverColor;
    initDefaultSnippetStyles();
  }

  setHighlightColor(color) {
    this.highlightColor = color;
  }

  setHoverColor(color) {
    this.hoverColor = color;
  }

  highlight(id, range) {
    const HighlightSnippet = window.customElements.get('highlight-snippet');
    const commonEnclosingElement = getCommonEnclosingElement(range);
    const highlightRanges = getHighlightRanges(range, commonEnclosingElement);

    return highlightRanges.map(r => {
      const snippet = new HighlightSnippet(
        id,
        this.highlightColor,
        this.hoverColor
      );
      document.body.appendChild(snippet); // hack to trigger connectedCallback()
      r.surroundContents(snippet);
      return snippet;
    });
  }

  restoreHighlight(highlightInfo) {
    const range = document.createRange();
    const {
      id,
      startData,
      endData,
      highlightColor,
      hoverColor
    } = highlightInfo;

    const startParent = getElemByTag(
      startData.parentTag,
      startData.parentOffset
    );

    const endParent = getElemByTag(endData.parentTag, endData.parentOffset);

    const { node: startContainer, offset: startOffset } = absToRelativeOffset(
      startParent,
      startData.absOffset,
      true
    );
    const { node: endContainer, offset: endOffset } = absToRelativeOffset(
      endParent,
      endData.absOffset
    );

    range.setStart(startContainer, startOffset);
    range.setEnd(endContainer, endOffset);

    this.setHighlightColor(highlightColor);
    this.setHoverColor(hoverColor);
    this.highlight(id, range);
  }
}
