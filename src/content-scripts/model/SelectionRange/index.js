import {
  getDocumentSelection,
  isSelectionBackwards,
  nodeInSelection,
  getNonWhitespaceOffset
} from '../../util/selection';

export default class SelectionRange {
  static fromDocumentSelection() {
    const selection = getDocumentSelection();

    if (!selection) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const isBackwards = isSelectionBackwards(selection);
    let elemToNormalize = isBackwards
      ? range.startContainer
      : range.endContainer;

    if (elemToNormalize.nodeType && elemToNormalize.nodeType === 3) {
      elemToNormalize = elemToNormalize.parentElement;
    }

    return new SelectionRange(range, elemToNormalize, isBackwards);
  }

  constructor(range, elemToNormalize, isBackwards) {
    console.log('_range:', range);
    this._range = range;
    this._elemToNormalize = elemToNormalize;
    this._isBackwards = isBackwards;
  }

  get isBackwards() {
    return this._isBackwards;
  }

  normalize() {
    this._elemToNormalize.normalize();
  }

  getAllSelectedRanges() {
    let container = this._range.commonAncestorContainer;
    if (container.nodeType !== 1) {
      container = container.parentElement; // not element so we set it to its parent elem
    }

    const selectedRanges = [];

    const acceptNodeFn = function(node) {
      return nodeInSelection(node, this._range)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    };

    const walkerFilter = {
      acceptNode: acceptNodeFn.bind(this)
    };

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      walkerFilter
    );

    const { startContainer, endContainer } = this._range;
    const { startOffset, endOffset } = getNonWhitespaceOffset(this._range);

    while (walker.nextNode()) {
      const curNode = walker.currentNode;

      const curRange = new Range();

      if (curNode === startContainer && curNode === endContainer) {
        curRange.setStart(curNode, startOffset);
        curRange.setEnd(curNode, endOffset);
      } else if (curNode === startContainer) {
        curRange.setStart(curNode, startOffset);
        curRange.setEnd(curNode, curNode.data.length);
      } else if (curNode === endContainer) {
        curRange.setStart(curNode, 0);
        curRange.setEnd(curNode, endOffset);
      } else {
        curRange.selectNode(curNode);
      }

      if (!curRange.collapsed) {
        selectedRanges.push(curRange);
      }
    }

    return selectedRanges;
  }
}
