import SelectionRange from './model/SelectionRange';
import '@webcomponents/custom-elements';
import { defineHighlightSnippet } from './model/HighlightSnippet';
import { prepareMenu, showMenu, hideMenu } from './util/menu';
import { highlight } from './util/highlight';
import { loadHighlights } from './db/store';

// initialisation
defineHighlightSnippet();
prepareMenu();
loadHighlights();

let currentMenu = null;
let range = null;

function cleanup() {
  hideMenu();
  currentMenu = null;
  range.normalize();
  document.getSelection().removeAllRanges();
}

document.onmouseup = function() {
  if (currentMenu) {
    return;
  }

  range = SelectionRange.fromDocumentSelection();

  if (range) {
    const menu = showMenu(range);
    currentMenu = menu;
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
  const { selectedRanges, color } = e.detail;
  console.log('in event listener', selectedRanges);

  if (!selectedRanges || !color) {
    return;
  }

  highlight(selectedRanges, color);
  cleanup();
});
