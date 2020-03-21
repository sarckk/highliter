import SelectionRange from './model/SelectionRange';
import '@webcomponents/custom-elements';
import { defineHighlightSnippet } from './model/HighlightSnippet';
import { prepareMenu, showMenu, hideMenu } from './util/menu';
import Highlighter from './model/Highlighter';

defineHighlightSnippet();
prepareMenu();

let currentMenu = null;
let range = null;
let selectedRanges = null;

function cleanup() {
  hideMenu();
  currentMenu = null;
  selectedRanges = null;
  range.normalize();
  document.getSelection().removeAllRanges();
}

document.onmouseup = function() {
  if (currentMenu) {
    return;
  }

  range = SelectionRange.fromDocumentSelection();

  if (range) {
    selectedRanges = range.getAllSelectedRanges();
    const { isBackwards } = range;
    currentMenu = showMenu(selectedRanges, isBackwards);
  }
};

document.onmousedown = function(e) {
  if (currentMenu && !currentMenu.contains(e.target)) {
    // user clicked outside of highlight options menu
    cleanup();
    return true;
  }
  if (currentMenu && currentMenu.contains(e.target)) {
    // user clicked inside menu
    return false;
  }
  return true;
};

document.addEventListener('highlight', e => {
  console.log('RECEIVED');

  const { color } = e.detail;

  if (!color) {
    return;
  }

  Highlighter.highlightFromSelection(selectedRanges, color);
  cleanup();
});
