import { NODE_TYPE_COMMENT } from './constants';

function getDocumentSelection() {
  const selection = document.getSelection();

  if (
    !selection ||
    selection.rangeCount === 0 ||
    selection.toString().match(/^\s*$/) ||
    selection.isCollapsed ||
    !selection.anchorNode ||
    !selection.focusNode
  ) {
    console.log('Invalid selection!');
    return null;
  }

  return selection;
}

function isSelectionBackwards(selection) {
  const testRange = new Range();
  testRange.setStart(selection.anchorNode, selection.anchorOffset);
  testRange.setEnd(selection.focusNode, selection.focusOffset);

  return testRange.collapsed;
}

function nodeInSelection(range, node) {
  return (
    node != null &&
    !node.data.match(/^\s*$/) &&
    node.nodeType !== NODE_TYPE_COMMENT &&
    node.parentElement.tagName !== 'SCRIPT' &&
    node.parentElement.tagName !== 'STYLE' &&
    node.parentElement.tagName !== 'NOSCRIPT' &&
    node.parentElement.offsetParent !== null && // not visible in the page
    range.intersectsNode(node)
  );
}

function getNonWhitespaceOffset(range) {
  const { startContainer, endContainer } = range; // at this point, startContainer and endContainer are guaranteed to be textNodes
  let { startOffset, endOffset } = range;
  const startEndSameContainers = startContainer === endContainer;

  if (startOffset === startContainer.data.length) {
    startOffset = -1;
  }

  if (endOffset === 0) {
    endOffset = -1;
  }

  while (
    startOffset <
      (startEndSameContainers ? endOffset : startContainer.data.length) &&
    startContainer.data.charAt(startOffset).match(/^\s*$/)
  ) {
    startOffset += 1;
  }

  while (
    endOffset > (startEndSameContainers ? startOffset : 0) &&
    endContainer.data.charAt(endOffset - 1).match(/^\s*$/)
  ) {
    endOffset -= 1;
  }

  return { startOffset, endOffset };
}

function getHighlightRanges(selectionRange) {
  const {
    startContainer,
    startOffset,
    endContainer,
    endOffset
  } = selectionRange.range;

  const range = document.createRange();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);

  const walker = document.createTreeWalker(
    selectionRange.commonEnclosingElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return nodeInSelection(range, node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    }
  );

  const selectedRanges = [];

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

  return selectedRanges;
}

export {
  getDocumentSelection,
  isSelectionBackwards,
  getNonWhitespaceOffset,
  getHighlightRanges
};
