import { getRanges } from "./range";

function createHighlight(color) {
  const hlRanges = getRanges();
  const HighlightSnippet = customElements.get("highlight-snippet");

  for (let r of hlRanges) {
    r.surroundContents(new HighlightSnippet(color));
  }
}

function generateColorOptions() {
  let colors = ["#F7A586", "#ECF786", "#9BEBAA", "#9BC1EB"];
  let colorOptions = [];
  for (let i = 0; i < 4; i++) {
    let optionWrapper = document.createElement("div");
    optionWrapper.classList.add(`highlight-option-wrapper`);

    let option = document.createElement("div");
    option.classList.add(`highlight-option-${i}`);
    option.classList.add("highlight-option");
    option.setAttribute("data-color", colors[i]);
    option.onclick = function(e) {
      const color = e.target.dataset.color;
      createHighlight(color);
    };

    optionWrapper.append(option);
    colorOptions.push(optionWrapper);
  }
  return colorOptions;
}

function getEndParentLineHeight(endParent) {
  if (endParent.nodeType !== 1) endParent = endParent.parentElement;

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

function getInsertionMarker(isBackwards) {
  let range = isBackwards ? getRanges()[0] : getRanges().slice(-1)[0];
  let tempPositionMarker = document.createElement("span");
  tempPositionMarker.innerHTML = "&#8203;"; // zero-width character
  let rangeCopy = range.cloneRange();
  rangeCopy.collapse(isBackwards); // if isBackwards is true, collapse(true) collapses to the start
  rangeCopy.insertNode(tempPositionMarker);

  return tempPositionMarker;
}

export function showHighlightMenu(isBackwards) {
  let highlightMenu = document.createElement("div");
  highlightMenu.classList.add("highlight-menu-container");

  let pointer = document.createElement("div");
  pointer.classList.add("highlight-menu-pointer");
  highlightMenu.append(pointer);

  let options = document.createElement("div");
  options.classList.add("highlight-menu-options");
  let hl_colors = generateColorOptions();
  hl_colors.forEach(c => options.append(c));
  highlightMenu.append(options);

  document.body.append(highlightMenu);

  /* Create and insert temporary span element to calculate position */
  let tempPositionMarker = getInsertionMarker(isBackwards);
  let markerCoords = tempPositionMarker.getBoundingClientRect(); // this has to come after insertNode, else it always returns 0 since it's not yet visible
  /******************************************************************/

  // Set vertical offset so that menu is always in view
  let range = document.getSelection().getRangeAt(0);
  const vertOffset = getEndParentLineHeight(range.endContainer);
  const windowHeight = document.documentElement.clientHeight;

  const BOTTOM_GAP = 10;
  const TOP_GAP = 8;
  const POINTER_HEIGHT = 6;

  let windowRelativeTopOffset =
    markerCoords.top +
    (isBackwards
      ? -highlightMenu.offsetHeight - BOTTOM_GAP
      : vertOffset + (TOP_GAP - POINTER_HEIGHT));

  let topOffset;

  let btmMenuAdjustment = vertOffset + TOP_GAP + window.pageYOffset;
  let tpMenuAdjustment =
    -highlightMenu.offsetHeight - BOTTOM_GAP + window.pageYOffset;

  if (windowRelativeTopOffset < 0 && isBackwards === true) {
    tempPositionMarker = getInsertionMarker(!isBackwards);
    markerCoords = tempPositionMarker.getBoundingClientRect();
    topOffset = markerCoords.top + btmMenuAdjustment;
    pointer.classList.add("pointer-top");
  } else if (windowRelativeTopOffset > windowHeight && isBackwards === false) {
    tempPositionMarker = getInsertionMarker(!isBackwards);
    markerCoords = tempPositionMarker.getBoundingClientRect();
    topOffset = markerCoords.top + tpMenuAdjustment;
    pointer.classList.add("pointer-bottom");
  } else {
    // no change in position of menu, proceed as usual
    topOffset =
      markerCoords.top + (isBackwards ? tpMenuAdjustment : btmMenuAdjustment);
    pointer.classList.add(isBackwards ? "pointer-bottom" : "pointer-top");
  }

  highlightMenu.style.top = topOffset + "px";

  // Set left offset so that menu is always in view
  let leftOffset =
    markerCoords.left - highlightMenu.offsetWidth / 2 + window.pageXOffset;

  let maxLeftOffset =
    document.documentElement.clientWidth +
    window.pageXOffset -
    highlightMenu.offsetWidth;

  if (leftOffset < 0) {
    leftOffset = 0;
  }
  if (leftOffset > maxLeftOffset) {
    leftOffset = maxLeftOffset;
  }

  highlightMenu.style.left = leftOffset + "px";

  tempPositionMarker.remove(); // cleanup, then normalize() takes care of joining text nodes back

  return highlightMenu;
}
