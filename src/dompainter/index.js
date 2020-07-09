import { getHighlightRanges } from '../util/selection';
import {
  getCommonEnclosingElement,
  getElemByTag,
  absToRelativeOffset
} from '../util/dom';

export default class DOMPainter {
  constructor(options) {
    this.highlightColor = options.originalHighlightColor;
    this.hoverColor = options.originalHoverColor;
    this.snippetTagName = options.snippetTagName;
  }

  setHighlightColor(color) {
    this.highlightColor = color;
  }

  setHoverColor(color) {
    this.hoverColor = color;
  }

  highlight(id, range) {
    const HighlightSnippet = window.customElements.get(this.snippetTagName);
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
