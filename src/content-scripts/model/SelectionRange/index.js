import { isSelectionBackwards, getHighlightRanges } from '../../util/selection';
import { getElemToNormalize, getDOMData } from './dom';
import {
  getCommonEnclosingElement,
  getClosestNextTextNode,
  getClosestPrevTextNode
} from '../../util/dom';
import { NODE_TYPE_TEXT } from '../../util/constants';

export default class SelectionRange {
  static fromSelection(selection) {
    const range = selection.getRangeAt(0);
    console.log('range:', range);

    if (range.startContainer.nodeType !== NODE_TYPE_TEXT) {
      const nextTextNode = getClosestNextTextNode(range.startContainer, false);
      range.setStart(nextTextNode, 0);
    }

    if (range.endContainer.nodeType !== NODE_TYPE_TEXT) {
      const prevTextNode = getClosestPrevTextNode(range.endContainer, false);
      range.setEnd(prevTextNode, prevTextNode.data.length);
    }

    const commonEnclosingElement = getCommonEnclosingElement(range);

    const highlightRanges = getHighlightRanges(range, commonEnclosingElement);

    if (highlightRanges.length === 0) {
      throw new Error('Invalid highlight selection - no text nodes selected');
    }

    const firstHRange = highlightRanges[0];
    const lastHRange = highlightRanges.slice(-1)[0];

    const adjustedRange = new Range();
    adjustedRange.setStart(firstHRange.startContainer, firstHRange.startOffset);
    adjustedRange.setEnd(lastHRange.endContainer, lastHRange.endOffset);

    const isBackwards = isSelectionBackwards(selection);
    const text = adjustedRange.toString();
    const elemToNormalize = getElemToNormalize(adjustedRange, isBackwards);

    return new SelectionRange(
      adjustedRange,
      highlightRanges,
      text,
      isBackwards,
      elemToNormalize
    );
  }

  constructor(range, highlightRanges, text, isBackwards, elemToNormalize) {
    this.range = range;
    this.highlightRanges = highlightRanges;
    this.text = text;
    this.isBackwards = isBackwards;
    this.elemToNormalize = elemToNormalize;
    this.normalizeElemChanged = false;
  }

  changeNormalizeElem() {
    this.isBackwards = !this.isBackwards; // side effect, refactor this soon
    const newElemToNormalize = getElemToNormalize(this.range, this.isBackwards);
    this.elemToNormalize = newElemToNormalize;
    this.normalizeElemChanged = true;
  }

  normalize() {
    this.elemToNormalize.normalize();
  }

  getHighlightInfo() {
    const startDOM = getDOMData(
      this.range.startContainer,
      this.range.startOffset
    );
    const endDOM = getDOMData(this.range.endContainer, this.range.endOffset);
    return {
      start: startDOM,
      end: endDOM,
      text: this.text,
      isBackwards: this.isBackwards,
      normalizeElemChanged: this.normalizeElemChanged
    };
  }
}
