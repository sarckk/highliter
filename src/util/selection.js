import {
  getClosestNextTextNode,
  getClosestPrevTextNode,
  getDOMData
} from './dom';
import { NODE_TYPE_TEXT } from './constants';

/*
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
*/

function isEmptyString(str) {
  return str.match(/^\s*$/);
}

function isSelectionBackwards(selection) {
  const testRange = new Range();
  testRange.setStart(selection.anchorNode, selection.anchorOffset);
  testRange.setEnd(selection.focusNode, selection.focusOffset);

  return testRange.collapsed;
}

function nodeInSelection(range, node, exclude) {
  return (
    node != null &&
    !isEmptyString(node.data) &&
    !exclude.includes(node.parentElement.tagName) &&
    window.getComputedStyle(node.parentElement).getPropertyValue('display') !==
      'none' &&
    range.intersectsNode(node)
  );
}

function getNonWhitespaceOffset(range) {
  // at this point, startContainer and endContainer are guaranteed to be textNodes
  const { startContainer, endContainer } = range;
  let { startOffset, endOffset } = range;
  const startEndSameContainers = startContainer === endContainer;

  while (
    startOffset <
      (startEndSameContainers ? endOffset : startContainer.data.length) &&
    isEmptyString(startContainer.data.charAt(startOffset))
  ) {
    startOffset += 1;
  }

  while (
    endOffset > (startEndSameContainers ? startOffset : 0) &&
    isEmptyString(endContainer.data.charAt(endOffset - 1))
  ) {
    endOffset -= 1;
  }

  return { sOffset: startOffset, eOffset: endOffset };
}

function getHighlightRanges(range, commonEnclosingElement, exclude) {
  const { startContainer, endContainer, startOffset, endOffset } = range;

  const walker = document.createTreeWalker(
    commonEnclosingElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return nodeInSelection(range, node, exclude)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    }
  );

  const selectedRanges = [];

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

/**
 * Clean Range object passed in as argument
 * by ensuring that the range starts and ends at
 * valid {startContainer, startOffset} as well as
 * {endContainer, endOffset}
 * and return the new Range object
 *
 * @param range          Range object containing info about current selected range
 * @return               another Range object after cleaning, null if invalid
 */
function cleanRange(range) {
  if (isEmptyString(range.toString())) {
    return null;
  }

  // take care of cases where startOffset = startContainer.length
  // and where endOffset = 0
  if (
    range.startOffset === range.startContainer.length ||
    range.startContainer.nodeType !== NODE_TYPE_TEXT
  ) {
    const nextTextNode = getClosestNextTextNode(range.startContainer, false);
    range.setStart(nextTextNode, 0);
  }

  if (range.endOffset === 0 || range.endContainer.nodeType !== NODE_TYPE_TEXT) {
    const prevTextNode = getClosestPrevTextNode(range.endContainer, false);
    range.setEnd(prevTextNode, prevTextNode.data.length);
  }

  return range;
}

function serialize(id, range, highlightColor, hoverColor) {
  const startData = getDOMData(range.startContainer, range.startOffset);
  const endData = getDOMData(range.endContainer, range.endOffset);
  const text = range.toString();

  return {
    id,
    text,
    startData,
    endData,
    highlightColor,
    hoverColor
  };
}

function isCompleteSelectionInfo(info) {
  const { id, text, startData, endData, highlightColor, hoverColor } = info;
  const startDataIsValid =
    startData &&
    startData.parentTag &&
    startData.parentOffset !== undefined &&
    startData.absOffset !== undefined;
  const endDataIsValid =
    endData &&
    endData.parentTag &&
    endData.parentOffset !== undefined &&
    endData.absOffset !== undefined;

  return (
    id &&
    text &&
    startDataIsValid &&
    endDataIsValid &&
    highlightColor &&
    hoverColor
  );
}

export {
  isSelectionBackwards,
  getNonWhitespaceOffset,
  getHighlightRanges,
  cleanRange,
  serialize,
  isCompleteSelectionInfo
};
