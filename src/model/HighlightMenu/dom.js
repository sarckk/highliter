export function getEndParentLineHeight(selectedRanges) {
  let range = selectedRanges.slice(-1)[0];
  let endParent = range.endContainer;
  if (endParent.nodeType !== 1) {
    endParent = endParent.parentElement;
  }

  let lineHeight = window
    .getComputedStyle(endParent)
    .getPropertyValue("line-height");
  let lastParentFontSize = window
    .getComputedStyle(endParent)
    .getPropertyValue("font-size");
  let lastParentLineHeight =
    lineHeight === "normal"
      ? parseFloat(lastParentFontSize) * 1.2 // an approximation
      : parseFloat(lineHeight);

  return lastParentLineHeight;
}
