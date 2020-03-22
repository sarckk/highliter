import {
  getDocumentSelection,
  isSelectionBackwards,
  nodeInSelection,
  getNonWhitespaceOffset
} from '../../util/selection';

export default class SelectionRange {
  static fromDocumentSelection() {
    const selection = getDocumentSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const selectionString = range.toString();
    let commonParentElement = range.commonAncestorContainer;

    if (commonParentElement.nodeType !== 1) {
      // not element so we set it to its parent elem
      commonParentElement = commonParentElement.parentElement;
    }

    const { startOffset, endOffset } = getNonWhitespaceOffset(range);

    const start = {
      startContainer: range.startContainer,
      startOffset
    };

    const end = {
      endContainer: range.endContainer,
      endOffset
    };

    const isBackwards = isSelectionBackwards(selection);

    let elemToNormalize = isBackwards
      ? range.startContainer
      : range.endContainer;

    if (elemToNormalize.nodeType && elemToNormalize.nodeType === 3) {
      elemToNormalize = elemToNormalize.parentElement;
    }

    return new SelectionRange(
      start,
      end,
      selectionString,
      commonParentElement,
      isBackwards,
      elemToNormalize
    );
  }

  constructor(
    start,
    end,
    selectionString,
    commonParentElement,
    isBackwards,
    elemToNormalize
  ) {
    this.start = start;
    this.end = end;
    this.selectionString = selectionString;
    this.commonParentElement = commonParentElement;
    this.isBackwards = isBackwards;
    this.elemToNormalize = elemToNormalize;
    this.selectedRanges = this._getAllSelectedRanges();
  }

  changeNormalizeElem() {
    this.isBackwards = !this.isBackwards; // side effect, refactor this soon

    let newNormalizeElem = this.isBackwards
      ? this.range.startContainer
      : this.range.endContainer;

    if (newNormalizeElem.nodeType && newNormalizeElem.nodeType === 3) {
      newNormalizeElem = newNormalizeElem.parentElement;
    }

    this.elemToNormalize = newNormalizeElem;
  }

  normalize() {
    this.elemToNormalize.normalize();
  }

  _getAllSelectedRanges() {
    const selectedRanges = [];

    const acceptNodeFn = function(node) {
      return nodeInSelection(node, this.start, this.end)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    };

    const walker = document.createTreeWalker(
      this.commonParentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: acceptNodeFn.bind(this)
      }
    );

    const { startContainer, startOffset } = this.start;
    const { endContainer, endOffset } = this.end;

    while (walker.nextNode()) {
      const curNode = walker.currentNode;
      const curRange = document.createRange();

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

    console.log('selectedRanges: ', selectedRanges);
    return selectedRanges;
  }
}
