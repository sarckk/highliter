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

function getLastParentLineHeight() {
  let range = document.getSelection().getRangeAt(0);
  let endParent = range.endContainer;
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
  let range = document.getSelection().getRangeAt(0);
  let tempPositionMarker = document.createElement("span");
  let rangeCopy = range.cloneRange();
  rangeCopy.collapse(isBackwards); // if isBackwards is true, collapse(true) collapses to the start
  rangeCopy.insertNode(tempPositionMarker);
  let markerCoords = tempPositionMarker.getBoundingClientRect(); // this has to come after insertNode, else it always returns 0 since it's not yet visible
  /******************************************************************/

  console.log(markerCoords.left);
  highlightMenu.style.left = `${markerCoords.left -
    highlightMenu.offsetWidth / 2 +
    window.pageXOffset}px`;

  const BOTTOM_GAP = 10;
  const TOP_GAP = 8;

  if (isBackwards) {
    // menu is at start
    highlightMenu.style.top = `${markerCoords.top -
      highlightMenu.offsetHeight -
      BOTTOM_GAP +
      window.pageYOffset}px`;
    pointer.classList.add("pointer-bottom");
  } else {
    const vertOffset = getLastParentLineHeight();
    highlightMenu.style.top = `${markerCoords.top +
      vertOffset +
      TOP_GAP +
      window.pageYOffset}px`;
    pointer.classList.add("pointer-top");
  }

  tempPositionMarker.remove(); // cleanup, then normalize() takes care of joining text nodes back

  return highlightMenu;
}
