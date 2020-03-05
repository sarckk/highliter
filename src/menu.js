import { getRanges } from "./range";

function createHighlight(hlRanges, color) {
  const HighlightSnippet = customElements.get("highlight-snippet");

  for (let r of hlRanges) {
    r.surroundContents(new HighlightSnippet(color));
  }
}

function generateColorOptions(hlRanges) {
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
      createHighlight(hlRanges, color);
    };

    optionWrapper.append(option);
    colorOptions.push(optionWrapper);
  }
  return colorOptions;
}

export function showHighlightMenu(range) {
  const OPTIONS_MENU_GAP_TOP = 10;
  const hlRanges = getRanges(range);
  const lastRange = hlRanges.slice(-1)[0];
  const lastRangeCoords = lastRange.getBoundingClientRect();

  let highlightMenu = document.createElement("div");
  highlightMenu.classList.add("highlight-menu-container");

  let pointer = document.createElement("div");
  pointer.classList.add("highlight-menu-pointer");
  highlightMenu.append(pointer);

  let options = document.createElement("div");
  options.classList.add("highlight-menu-options");

  let hl_colors = generateColorOptions(hlRanges);
  for (let color of hl_colors) {
    options.append(color);
  }

  highlightMenu.append(options);

  document.body.append(highlightMenu);

  // set highlight menu position
  highlightMenu.style.top =
    lastRangeCoords.bottom + window.pageYOffset + OPTIONS_MENU_GAP_TOP + "px";
  highlightMenu.style.left =
    lastRangeCoords.right +
    window.pageXOffset -
    highlightMenu.offsetWidth / 2 +
    "px";

  console.log("SHOW HIGHLIGHT OPTIONS", highlightMenu);
  return highlightMenu;
}
