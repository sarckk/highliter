import { NODE_TYPE_TEXT } from '../../util/constants';

function getElemToNormalize(range, isBackwards) {
  let elemToNormalize = isBackwards ? range.startContainer : range.endContainer;

  if (elemToNormalize.nodeType && elemToNormalize.nodeType === NODE_TYPE_TEXT) {
    elemToNormalize = elemToNormalize.parentElement;
  }
  return elemToNormalize;
}

function getDOMData(container, offset) {
  // container is guaranteed to be a text node (e.g. p.firstChild)
  const parent = container.parentElement;
  const parentTag = parent.tagName.toLowerCase();
  const listOfParentTags = document.body.querySelectorAll(parentTag);
  const parentOffset = Array.from(listOfParentTags).indexOf(parent);
  const textNodeOffset = Array.from(parent.childNodes).indexOf(container);
  // console.log('container: ', container.cloneNode(true));
  /*
  console.log(
    'parent.childNodes: ',
    Array.prototype.map.call(parent.childNodes, n => n.cloneNode(true))
  );
  */

  return {
    parentTag,
    parentOffset,
    textNodeOffset,
    innerOffset: offset
  };
}

export { getElemToNormalize, getDOMData };
