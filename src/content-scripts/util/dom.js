import {
  ZERO_WIDTH_SPACE,
  NODE_TYPE_COMMENT,
  NODE_TYPE_TEXT,
  NODE_TYPE_ELEMENT
} from './constants';

function getSnippetsByDataId(id) {
  return document.querySelectorAll(`[data-highlight-id='${id}']`);
}

function addInsertionMarker(range, isBackwards) {
  const tempMarker = document.createElement('span');
  tempMarker.innerHTML = ZERO_WIDTH_SPACE; // zero-width character

  const rangeCopy = range.cloneRange();
  rangeCopy.collapse(isBackwards); // if isBackwards==true, collapses to the start
  rangeCopy.insertNode(tempMarker);

  return tempMarker;
}

/**
 * based on mozilla documentation: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace
 */
function ignorable(node) {
  return (
    node.nodeType === NODE_TYPE_COMMENT ||
    (node.nodeType === NODE_TYPE_TEXT && node.data.match(/^\s*$/)) ||
    node.nodeType === NODE_TYPE_ELEMENT
  );
}

function isNonEmptyElement(node) {
  return (
    node.nodeType === NODE_TYPE_ELEMENT && !node.textContent.match(/^\s*$/)
  );
}

/**
 *
 * Gets closest next text node from a node
 * skipping whitespace or cojmments.
 *
 * @param node           The reference node.
 * @param includeItself .Boolean value indicating whether the node itself counts as the cloest next node to itself
 * @return               Either:
 *                         1) The closest next text node which is not a whitespace or comment
 *                         2) Null if such node doesn't exist
 */
function getClosestNextTextNode(node, includeItself) {
  let currentNode = includeItself
    ? node
    : node.nextSibling || node.parentElement.nextSibling;

  while (currentNode) {
    if (isNonEmptyElement(currentNode)) {
      return getClosestNextTextNode(currentNode.firstChild, true);
    }

    if (!ignorable(currentNode)) {
      return currentNode;
    }

    currentNode =
      currentNode.nextSibling || currentNode.parentElement.nextSibling;
  }

  return null;
}

/**
 * Gets closest previous text node from a node
 * skipping whitespace or cojmments.
 *
 * @param node           The reference node.
 * @param includeItself .Boolean value indicating whether the node itself counts as the cloest previous node to itself
 * @return               Either:
 *                         1) The closest previous text node which is not a whitespace or comment
 *                         2) Null if such node doesn't exist
 */
function getClosestPrevTextNode(node, includeItself) {
  let currentNode = includeItself
    ? node
    : node.previousSibling || node.parentElement.previousSibling;

  while (currentNode) {
    if (isNonEmptyElement(currentNode)) {
      return getClosestPrevTextNode(currentNode.lastChild, true);
    }

    if (!ignorable(currentNode)) {
      return currentNode;
    }

    currentNode =
      currentNode.previousSibling || currentNode.parentElement.previousSibling;
  }

  return null;
}

function getCommonEnclosingElement(range) {
  let parent = range.commonAncestorContainer;

  if (parent.nodeType !== 1) {
    // not element so we set it to its parent elem
    parent = parent.parentElement;
  }

  return parent;
}

export {
  getSnippetsByDataId,
  addInsertionMarker,
  getClosestNextTextNode,
  getClosestPrevTextNode,
  getCommonEnclosingElement
};
