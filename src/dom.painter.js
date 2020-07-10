import { getHighlightRanges, isCompleteSelectionInfo } from './util/selection';
import {
  getCommonEnclosingElement,
  getElemByTag,
  absToRelativeOffset
} from './util/dom';

export default class DOMPainter {
  constructor(options) {
    this.highlightColor = options.originalHighlightColor;
    this.hoverColor = options.originalHoverColor;
    this.customTagName = options.customTagName;
    this.exclude = options.exclude;
  }

  setHighlightColor(color) {
    this.highlightColor = color;
  }

  setHoverColor(color) {
    this.hoverColor = color;
  }

  highlight(id, range) {
    const HighlightSnippet = window.customElements.get(this.customTagName);
    const commonEnclosingElement = getCommonEnclosingElement(range);
    const highlightRanges = getHighlightRanges(
      range,
      commonEnclosingElement,
      this.exclude
    );

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
    if (!isCompleteSelectionInfo(highlightInfo)) {
      throw new Error('Malformed highlight data');
    }

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

    if (!startParent || !endParent) {
      throw new Error('Invalid parentTag or parentOffset');
    }

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

    if (range.collapsed) {
      throw new Error('Invalid range described by highlight data');
    }

    this.setHighlightColor(highlightColor);
    this.setHoverColor(hoverColor);
    this.highlight(id, range);
  }
}
