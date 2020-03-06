function textInSelection(node, range) {
  return !node.data.match(/^\s+$/) && range.intersectsNode(node);
}

function getSelectionRanges(range) {
  let container = range.commonAncestorContainer;
  if (container.nodeType !== 1) {
    container = container.parentElement; // not element so we set it to its parent elem
  }

  let selectionRanges = [];

  let walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return textInSelection(node, range)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });

  while (walker.nextNode()) {
    let curNode = walker.currentNode;
    let curRange = new Range();

    curRange.selectNode(curNode);
    if (curNode === range.startContainer) {
      if (range.startContainer === range.endContainer) {
        curRange.setStart(curNode, range.startOffset);
        curRange.setEnd(curNode, range.endOffset);
      } else {
        curRange.setStart(curNode, range.startOffset);
      }
    } else if (curNode === range.endContainer) {
      curRange.setEnd(curNode, range.endOffset);
    }

    selectionRanges.push(curRange);
  }

  return selectionRanges;
}

export { getSelectionRanges as getRanges };
