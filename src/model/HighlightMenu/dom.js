function getEndParentLineHeight(selectedRanges) {
  const range = selectedRanges.slice(-1)[0];
  let endParent = range.endContainer;
  if (endParent.nodeType !== 1) {
    endParent = endParent.parentElement;
  }

  const lineHeight = window
    .getComputedStyle(endParent)
    .getPropertyValue('line-height');
  const lastParentFontSize = window
    .getComputedStyle(endParent)
    .getPropertyValue('font-size');
  const lastParentLineHeight =
    lineHeight === 'normal'
      ? parseFloat(lastParentFontSize) * 1.2 // an approximation
      : parseFloat(lineHeight);

  return lastParentLineHeight;
}

export { getEndParentLineHeight };
