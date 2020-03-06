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

function setMenuAtEnd(highlightMenu, pointer) {
  const TOP_GAP = 8;
  const vertOffset = getLastParentLineHeight();
  highlightMenu.style.marginTop = `${vertOffset + TOP_GAP}px`;
  pointer.classList.add("pointer-top");
}

function setMenuAtStart(highlightMenu, pointer) {
  const BOTTOM_GAP = 10;
  highlightMenu.style.marginTop = `-${highlightMenu.offsetHeight +
    BOTTOM_GAP}px`;
  pointer.classList.add("pointer-bottom");
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

  for (let color of hl_colors) {
    options.append(color);
  }

  highlightMenu.append(options);

  let range = document.getSelection().getRangeAt(0);
  let newRange = range.cloneRange();
  newRange.collapse(isBackwards); // if isBackwards is true, collapse(true) collapses to the start
  newRange.insertNode(highlightMenu);

  highlightMenu.style.marginLeft = `-${highlightMenu.offsetWidth / 2}px`;

  if (isBackwards) {
    setMenuAtStart(highlightMenu, pointer);
  } else {
    setMenuAtEnd(highlightMenu, pointer);
  }

  return highlightMenu;
}
