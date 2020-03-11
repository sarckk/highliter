import SelectionRange from './model/SelectionRange';
import HighlightMenu from './model/HighlightMenu';
import '@webcomponents/custom-elements';
import { defineHighlightSnippet } from './model/HighlightSnippet';

defineHighlightSnippet();

let currentMenu = null;
let range = null;

function cleanup() {
  range.normalize();
  document.getSelection().removeAllRanges();
}

document.onmouseup = function() {
  if (currentMenu) {
    return;
  }

  range = SelectionRange.fromDocumentSelection();

  if (range) {
    currentMenu = new HighlightMenu(range); // display option to highlight
  }
};

document.onmousedown = function(e) {
  if (currentMenu && !currentMenu.contains(e.target)) {
    // user clicked outside of highlight options menu
    currentMenu.remove();
    currentMenu = null;
    cleanup();
    return true;
  }
  if (currentMenu && currentMenu.contains(e.target)) {
    // user clicked inside menu
    return false;
  }
  return true;
};

document.onclick = function(e) {
  // when we click on button, mouseup is triggered before onclick but
  // since currentMenu is not deleted at this point, we still don't create
  // a new highlight mneu
  if (e.target.classList.contains('highlight-option')) {
    currentMenu.remove();
    cleanup();
  }
};
