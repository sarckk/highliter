function getDOMData({ container, offset }) {
  // container is guaranteed to be a text node (e.g. p.firstChild)
  const parent = container.parentElement;
  console.log('parent: ', parent);
  const parentTag = parent.tagName.toLowerCase();
  const listOfParentTags = document.body.querySelectorAll(parentTag);
  const parentOffset = Array.from(listOfParentTags).indexOf(parent);
  const textNodeOffset = Array.from(parent.childNodes).indexOf(container);
  console.log('container: ', container.cloneNode(true));
  console.log(
    'parent.childNodes: ',
    Array.prototype.map.call(parent.childNodes, n => n.cloneNode(true))
  );

  return {
    parentTag,
    parentOffset,
    textNodeOffset,
    innerOffset: offset
  };
}

export { getDOMData };
