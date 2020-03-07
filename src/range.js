function isBackwards(selection) {
  let testRange = new Range();
  testRange.setStart(selection.anchorNode, selection.anchorOffset);
  testRange.setEnd(selection.focusNode, selection.focusOffset);

  return testRange.collapsed;
}

function textInSelection(node, currentRange) {
  return (
    node != null &&
    !node.data.match(/^\s+$/) &&
    currentRange.intersectsNode(node)
  );
}

function getSelectionRanges() {
  let range = document.getSelection().getRangeAt(0);
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

    if (curNode === range.startContainer && curNode === range.endContainer) {
      curRange.setStart(curNode, range.startOffset);
      curRange.setEnd(curNode, range.endOffset);
    } else if (curNode === range.startContainer) {
      curRange.setStart(curNode, range.startOffset);
      curRange.setEnd(curNode, curNode.data.length);
    } else if (curNode === range.endContainer) {
      curRange.setStart(curNode, 0);
      curRange.setEnd(curNode, range.endOffset);
    } else {
      curRange.selectNode(curNode);
    }

    if (curRange.collapsed) {
      continue;
    }

    selectionRanges.push(curRange);
  }

  return selectionRanges;
}

export { getSelectionRanges as getRanges, isBackwards };
