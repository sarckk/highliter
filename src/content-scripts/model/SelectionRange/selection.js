import { nodeInSelection } from '../../util/selection';

function getIndividualRanges(start, end, commonParentElement) {
  const selectedRanges = [];
  const range = document.createRange();
  range.setStart(start.container, start.offset);
  range.setEnd(end.container, end.offset);
  console.log('Range:', range);

  const walker = document.createTreeWalker(
    commonParentElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return nodeInSelection(range, node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    }
  );

  const { container: startContainer, offset: startOffset } = start;
  const { container: endContainer, offset: endOffset } = end;

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

export { getIndividualRanges };
