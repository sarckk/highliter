import { showHighlightMenu } from "./menu";

let currentMenu = null;

document.onmouseup = function(e) {
  const selection = document.getSelection();

  if (!selection || selection.rangeCount == 0 || selection.isCollapsed) {
    return;
  }

  const range = selection.getRangeAt(0);

  if (!currentMenu) {
    currentMenu = showHighlightMenu(range); // display option to highlight
  }
};

document.onmousedown = function(e) {
  if (currentMenu && !currentMenu.contains(e.target)) {
    currentMenu.remove();
    document.getSelection().removeAllRanges();
    currentMenu = null;
  } else if (currentMenu && currentMenu.contains(e.target)) {
    let prevSelectedRange = document.getSelection().getRangeAt(0);
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(prevSelectedRange);
    return false; // only works because we didn't use addEventListener
  }
};

document.onclick = function(e) {
  if (e.target.classList.contains("highlight-option")) {
    document.getSelection().removeAllRanges();
    if (currentMenu) currentMenu.remove();
  }
};
