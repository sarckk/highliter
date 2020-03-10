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
