export function getDocumentSelection() {
  const selection = document.getSelection();

  if (
    !selection ||
    selection.rangeCount === 0 ||
    selection.isCollapsed ||
    !selection.anchorNode ||
    !selection.focusNode ||
    selection.anchorNode.nodeType !== 3 ||
    selection.focusNode.nodeType !== 3
  ) {
    return null;
  }

  return selection;
}

export function isSelectionBackwards(selection) {
  const testRange = new Range();
  testRange.setStart(selection.anchorNode, selection.anchorOffset);
  testRange.setEnd(selection.focusNode, selection.focusOffset);

  return testRange.collapsed;
}

export function nodeInSelection(range, node) {
  return (
    node != null &&
    !node.data.match(/^\s*$/) &&
    node.nodeType !== 8 && // node is not comment node
    node.parentElement.tagName !== 'SCRIPT' &&
    node.parentElement.tagName !== 'STYLE' &&
    node.parentElement.tagName !== 'NOSCRIPT' &&
    node.parentElement.offsetParent !== null && // not visible in the page
    range.intersectsNode(node)
  );
}

export function getNonWhitespaceOffset(range) {
  const { startContainer, endContainer } = range;
  let { startOffset, endOffset } = range;
  const startEndSameContainers = startContainer === endContainer;

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
