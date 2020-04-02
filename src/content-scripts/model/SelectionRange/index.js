import {
  getNonWhitespaceOffset,
  isSelectionBackwards
} from '../../util/selection';
import { getElemToNormalize, getDOMData } from './dom';
import {
  getClosestPrevTextNode,
  getClosestNextTextNode,
  getCommonEnclosingElement
} from '../../util/dom';
import { NODE_TYPE_TEXT } from '../../util/constants';

export default class SelectionRange {
  static fromSelection(selection) {
    const isBackwards = isSelectionBackwards(selection);
    const range = selection.getRangeAt(0);
    console.log('Range: ', range.cloneRange());
    const { startContainer, endContainer } = range;

    // check if node's start is not text node, in which case getNext/getPrev closest text node;
    if (startContainer.nodeType !== NODE_TYPE_TEXT) {
      const nextTextNode = getClosestNextTextNode(startContainer, false);
      range.setStart(nextTextNode, 0);
    }

    if (endContainer.nodeType !== NODE_TYPE_TEXT) {
      const prevTextNode = getClosestPrevTextNode(endContainer, false);
      range.setEnd(prevTextNode, prevTextNode.data.length);
    }

    const { startOffset, endOffset } = getNonWhitespaceOffset(range);
    range.setStart(range.startContainer, startOffset);
    range.setEnd(range.endContainer, endOffset);

    if (startOffset === -1) {
      const prevTextNode = getClosestPrevTextNode(range.endContainer, false);
      range.setStart(prevTextNode, prevTextNode.data.length);
    }

    if (endOffset === -1) {
      const nextTextNode = getClosestNextTextNode(range.startContainer, false);
      range.setEnd(nextTextNode);
    }

    const text = range.toString();
    const commonEnclosingElement = getCommonEnclosingElement(range);
    const elemToNormalize = getElemToNormalize(range, isBackwards);

    return new SelectionRange(
      range,
      text,
      commonEnclosingElement,
      isBackwards,
      elemToNormalize
    );
  }

  constructor(
    range,
    text,
    commonEnclosingElement,
    isBackwards,
    elemToNormalize
  ) {
    this.range = range;
    this.text = text;
    this.commonEnclosingElement = commonEnclosingElement;
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
