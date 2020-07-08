/* eslint-disable no-plusplus */
import {
  NODE_TYPE_COMMENT,
  NODE_TYPE_TEXT,
  NODE_TYPE_ELEMENT
} from './constants';

function isEmptyString(str) {
  return str.match(/^\s*$/);
}

/**
 * based on mozilla documentation: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace
 */
function ignorable(node) {
  return (
    node.nodeType === NODE_TYPE_COMMENT ||
    (node.nodeType === NODE_TYPE_TEXT && isEmptyString(node.data)) ||
    node.nodeType === NODE_TYPE_ELEMENT
  );
}

function isNonEmptyElement(node) {
  return (
    node.nodeType === NODE_TYPE_ELEMENT && !isEmptyString(node.textContent)
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

  if (parent.nodeType !== NODE_TYPE_ELEMENT) {
    // not element so we set it to its parent elem
    parent = parent.parentElement;
  }

  return parent;
}

function getNodeOffset(node) {
  let n = node;
  let offset = 0;
  while (n.previousSibling) {
    n = n.previousSibling;
    offset += n.textContent.length;
  }
  return offset;
}

function getDOMData(container, offset) {
  // container is guaranteed to be a text node (e.g. p.firstChild)
  const parent = container.parentElement;
  const parentTag = parent.tagName.toLowerCase();
  const listOfParentTags = document.querySelectorAll(parentTag);
  const parentOffset = Array.from(listOfParentTags).indexOf(parent);
  const absOffset = getNodeOffset(container) + offset;

  return {
    parentTag,
    parentOffset,
    absOffset
  };
}

function getElemByTag(tagName, offset) {
  return document.querySelectorAll(tagName)[offset];
}

function absToRelativeOffset(parent, absOffset, isStartOffset = false) {
  const stack = [parent];
  let currentNode = null;
  let currentOffset = 0;
  let nextOffset;

  while (stack.length !== 0) {
    currentNode = stack.pop();

    if (currentNode.nodeType !== NODE_TYPE_TEXT) {
      for (let i = currentNode.childNodes.length - 1; i >= 0; i--) {
        stack.push(currentNode.childNodes[i]);
      }
    } else {
      nextOffset = currentOffset + currentNode.length;

      if (isStartOffset) {
        /*
          if calculating startOffset, relativeOffset can be 0, in which case
          we break only when absOffset is strictly less than nextOffset
          to break on the correct $currentNode
        */
        if (absOffset < nextOffset) {
          break;
        }
      } else if (absOffset <= nextOffset) {
        break;
      }

      currentOffset = nextOffset;
    }
  }

  const relativeOffset = absOffset - currentOffset;

  return { node: currentNode, offset: relativeOffset };
}

export {
  isEmptyString,
  getClosestNextTextNode,
  getClosestPrevTextNode,
  getCommonEnclosingElement,
  getDOMData,
  getElemByTag,
  absToRelativeOffset
};
