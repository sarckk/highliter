export function getDocumentSelection() {
  const selection = document.getSelection();

  if (!selection || selection.rangeCount == 0 || selection.isCollapsed) {
    return null;
  }

  return selection;
}

export function isSelectionBackwards(selection) {
  let testRange = new Range();
  testRange.setStart(selection.anchorNode, selection.anchorOffset);
  testRange.setEnd(selection.focusNode, selection.focusOffset);

  return testRange.collapsed;
}

export function nodeInSelection(node, selectedRange) {
  return (
    node != null &&
    !node.data.match(/^\s*$/) &&
    selectedRange.intersectsNode(node)
  );
}

export function getNonWhitespaceOffset(range) {
  let { startContainer, endContainer, startOffset, endOffset } = range;
  let startEndSameContainers = startContainer === endContainer;

  console.log(`before: ${startOffset} and ${endOffset}`);

  while (startContainer.nodeType !== 3) {
    startContainer = startContainer.firstChild;
  }

  while (endContainer.nodeType !== 3) {
    endContainer = endContainer.firstChild;
  }

  let charAtIndex;

  while (
    (charAtIndex = startContainer.data.charAt(startOffset)).match(/^\s*$/) &&
    startOffset <
      (startEndSameContainers ? endOffset : startContainer.data.length)
  ) {
    startOffset++;
  }

  while (
    (charAtIndex = endContainer.data.charAt(endOffset - 1)).match(/^\s*$/) &&
    endOffset > (startEndSameContainers ? startOffset : 0)
  ) {
    endOffset--;
  }

  console.log(`after: ${startOffset} and ${endOffset}`);

  return { startOffset, endOffset };
}
