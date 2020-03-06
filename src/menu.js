import { getRanges } from "./range";

function createHighlight(range, color) {
  const hlRanges = getRanges(range);
  const HighlightSnippet = customElements.get("highlight-snippet");

  for (let r of hlRanges) {
    r.surroundContents(new HighlightSnippet(color));
  }
}

function generateColorOptions(range) {
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
      createHighlight(range, color);
    };

    optionWrapper.append(option);
    colorOptions.push(optionWrapper);
  }
  return colorOptions;
}

export function showHighlightMenu(range) {
  const TOP_GAP = 3;

  let highlightMenu = document.createElement("div");
  highlightMenu.classList.add("highlight-menu-container");

  let pointer = document.createElement("div");
  pointer.classList.add("highlight-menu-pointer");
  highlightMenu.append(pointer);

  let options = document.createElement("div");
  options.classList.add("highlight-menu-options");

  let hl_colors = generateColorOptions(range);

  for (let color of hl_colors) {
    options.append(color);
  }

  highlightMenu.append(options);

  let newRange = range.cloneRange();
  newRange.collapse(false);
  newRange.insertNode(highlightMenu);

  highlightMenu.style.marginLeft = `-${highlightMenu.offsetWidth / 2}px`;

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

  console.log(lastParentLineHeight + TOP_GAP);

  highlightMenu.style.marginTop = `${lastParentLineHeight + TOP_GAP}px`;

  return highlightMenu;
}
