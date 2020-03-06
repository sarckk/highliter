import { showHighlightMenu } from "./menu";
import { isBackwards } from "./range";

let currentMenu = null;
let elemToNormalize = null;

document.onmouseup = function(e) {
  const selection = document.getSelection();

  if (!selection || selection.rangeCount == 0 || selection.isCollapsed) {
    return;
  }

  if (!currentMenu) {
    const range = selection.getRangeAt(0);
    elemToNormalize = range.endContainer;

    if (elemToNormalize.nodeType === 3) {
      elemToNormalize = elemToNormalize.parentElement;
    }

    const backwards = isBackwards(selection);
    currentMenu = showHighlightMenu(backwards); // display option to highlight
  }
};

document.onmousedown = function(e) {
  if (currentMenu && !currentMenu.contains(e.target)) {
    // user clicked outside of highlight options menu
    currentMenu.remove();

    if (elemToNormalize) elemToNormalize.normalize(); // important that we normalize after removing currentMenu

    document.getSelection().removeAllRanges(); // when we click out of menu, this ensures that mouseup doesn't create another menu (since !currentMenu condition is fulfilled)
    currentMenu = null;
  } else if (currentMenu && currentMenu.contains(e.target)) {
    // user clicked inside menu
    return false; // only works because we didn't use addEventListener
  }
};

document.onclick = function(e) {
  // when we click on button, mouseup is triggered before onclick but
  // since currentMenu is not deleted at this point, we still don't create
  // a new highlight mneu
  if (e.target.classList.contains("highlight-option")) {
    if (currentMenu) currentMenu.remove();
    if (elemToNormalize) elemToNormalize.normalize();
    document.getSelection().removeAllRanges();
  }
};
