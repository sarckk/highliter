import { getNonWhitespaceOffset } from '../../util/selection';
import { getIndividualRanges } from './selection';
import { getDOMData } from './dom';

export default class SelectionRange {
  static fromRange(range, isBackwards, text) {
    let commonParentElement = range.commonAncestorContainer;

    if (commonParentElement.nodeType !== 1) {
      // not element so we set it to its parent elem
      commonParentElement = commonParentElement.parentElement;
    }

    const { startOffset, endOffset } = getNonWhitespaceOffset(range);

    let start = {
      container: range.startContainer,
      offset: startOffset
    };

    let end = {
      container: range.endContainer,
      offset: endOffset
    };

    const selectedRanges = getIndividualRanges(start, end, commonParentElement);

    if (selectedRanges.length === 0) {
      throw new Error('Selection contains only white-space characters');
    }

    const adjustedRange = document.createRange();
    const firstRange = selectedRanges[0];
    const lastRange = selectedRanges.slice(-1)[0];

    adjustedRange.setStart(firstRange.startContainer, firstRange.startOffset);
    adjustedRange.setEnd(lastRange.endContainer, lastRange.endOffset);

    start = {
      container: adjustedRange.startContainer,
      offset: adjustedRange.startOffset
    };

    end = {
      container: adjustedRange.endContainer,
      offset: adjustedRange.endOffset
    };

    const selectionString = text || adjustedRange.toString();
    let newCommonParentElement = adjustedRange.commonAncestorContainer;

    if (newCommonParentElement.nodeType !== 1) {
      // not element so we set it to its parent elem
      newCommonParentElement = newCommonParentElement.parentElement;
    }

    let elemToNormalize = isBackwards ? start.container : end.container;

    if (elemToNormalize.nodeType && elemToNormalize.nodeType === 3) {
      elemToNormalize = elemToNormalize.parentElement;
    }

    return new SelectionRange(
      start,
      end,
      selectionString,
      newCommonParentElement,
      isBackwards,
      elemToNormalize,
      selectedRanges
    );
  }

  constructor(
    start,
    end,
    selectionString,
    commonParentElement,
    isBackwards,
    elemToNormalize,
    selectedRanges
  ) {
    this.start = start;
    this.end = end;
    this.selectionString = selectionString;
    this.commonParentElement = commonParentElement;
    this.isBackwards = isBackwards;
    this.elemToNormalize = elemToNormalize;
    this.selectedRanges = selectedRanges;
    this.normalizeElemChanged = false;
  }

  changeNormalizeElem() {
    this.isBackwards = !this.isBackwards; // side effect, refactor this soon
    this.normalizeElemChanged = true;

    let newNormalizeElem = this.isBackwards
      ? this.start.container
      : this.end.container;

    if (newNormalizeElem.nodeType && newNormalizeElem.nodeType === 3) {
      newNormalizeElem = newNormalizeElem.parentElement;
    }

    this.elemToNormalize = newNormalizeElem;
  }

  normalize() {
    this.elemToNormalize.normalize();
  }

  getHighlightInfo() {
    const startDOM = getDOMData(this.start);
    const endDOM = getDOMData(this.end);
    return {
      start: startDOM,
      end: endDOM,
      text: this.selectionString,
      isBackwards: this.isBackwards,
      normalizeElemChanged: this.normalizeElemChanged
    };
  }
}
