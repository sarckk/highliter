function textInSelection(node, range) {
  return !node.data.match(/^\s+$/) && range.intersectsNode(node);
}

/*
function sendSelectionText(selection) {
  let selectedText = selection.toString();

  chrome.runtime.sendMessage({ selectedText }, function(response) {
    console.log(response.confirm);
  });
}
*/

document.onmouseup = function() {
  let selection = document.getSelection();

  if (!selection || selection.rangeCount == 0 || selection.isCollapsed) {
    return;
  }

  let range = selection.getRangeAt(0);

  let container = range.commonAncestorContainer;
  if (container.nodeType != 1) {
    // shared container is not an element (nodeType = 1)
    // thus we set it to its parentElement
    container = container.parentElement;
  }

  let walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return textInSelection(node, range)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    },
    false
  );

  let highlightRanges = [];

  while (walker.nextNode()) {
    let currentNode = walker.currentNode;
    let currentNodeData = currentNode.data;
    let localHighlightRange = new Range();

    localHighlightRange.selectNode(currentNode);

    if (currentNode === range.startContainer) {
      if (range.startContainer === range.endContainer) {
        currentNodeData = currentNodeData.substring(
          range.startOffset,
          range.endOffset
        );

        localHighlightRange.setStart(currentNode, range.startOffset);
        localHighlightRange.setEnd(currentNode, range.endOffset);
      } else {
        currentNodeData = currentNodeData.substring(range.startOffset);

        localHighlightRange.setStart(currentNode, range.startOffset);
        localHighlightRange.setEndAfter(currentNode);
      }
    } else if (currentNode === range.endContainer) {
      currentNodeData = currentNodeData.substring(0, range.endOffset);

      localHighlightRange.setStartBefore(currentNode);
      localHighlightRange.setEnd(currentNode, range.endOffset);
    }

    console.log(currentNodeData);

    highlightRanges.push(localHighlightedRange);
  }

  for (let r of highlightRanges) {
    r.surroundContents(document.createElement("i"));
  }
};
