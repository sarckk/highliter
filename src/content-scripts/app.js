import SelectionRange from './model/SelectionRange';
import '@webcomponents/custom-elements';
import { defineHighlightSnippet } from './model/HighlightSnippet';
import { prepareMenu, showMenu, hideMenu } from './util/menu';
import { highlightFromRange } from './util/highlight';
import Store from './db/store';
import { getDocumentSelection, isSelectionBackwards } from './util/selection';

const store = new Store(window.location.href);

// initialisation
// store.clearAll();
defineHighlightSnippet();
prepareMenu();

window.addEventListener('load', () => {
  store.loadHighlights();
});

let currentMenu = null;
let selectionRange = null;

function cleanup() {
  hideMenu();
  currentMenu = null;
  selectionRange.normalize();
  document.getSelection().removeAllRanges();
}

document.onmouseup = function() {
  if (currentMenu) {
    return;
  }

  const selection = getDocumentSelection();

  if (!selection) {
    return;
  }

  const range = selection.getRangeAt(0);
  const isBackwards = isSelectionBackwards(selection);
  const text = range.toString();

  try {
    selectionRange = SelectionRange.fromRange(range, isBackwards, text);
    console.log('selectionRange:', selectionRange);
  } catch (e) {
    console.error('Error: ', e.message);
    return;
  }

  if (selectionRange) {
    const menu = showMenu(selectionRange);
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
  cleanup(); // do cleanup first because normalization has to take place before storing highlight info (since it makes use of .childNodes)

  const { color } = e.detail;

  if (!color) {
    return;
  }

  const highlightInfo = selectionRange.getHighlightInfo();
  console.log('highlightInfo created: ', highlightInfo);

  const highlightId = highlightFromRange(selectionRange.selectedRanges, color);
  store.saveHighlight(highlightInfo, color, highlightId);
});
