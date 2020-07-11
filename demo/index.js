// eslint-disable-next-line import/no-unresolved
import jscolor from 'jscolor';
import Highliter from '../src/index';
import './index.css';
import * as store from './store';
import { prepareMenu } from './menu';
import { getRealPos } from './helpers';
import { makePanelDraggable } from './draggable';

makePanelDraggable();

// create menu
const menu = prepareMenu();

// create delete prompt
const delPrompt = document.createElement('div');
document.body.appendChild(delPrompt);
delPrompt.classList.add('del-prompt');
delPrompt.classList.add('hidden');
delPrompt.textContent = 'delete';

function setPromptAt(el) {
  delPrompt.classList.remove('hidden');
  const { left, top } = getRealPos(el);
  delPrompt.style.left = `${left - delPrompt.offsetWidth / 2}px`;
  delPrompt.style.top = `${top - delPrompt.offsetHeight - 5}px`;
  delPrompt.dataset.id = el.dataset.highlightId;
}

// constants
const DEFAULT_HIGHLIGHT_COLOR = '#FBFF75';
const DEFAULT_HOVER_COLOR = '#F9D186';
const CUSTOM_TAGNAME = 'custom-elem';

// dom methods
function getSnippetsByHighlightID(id) {
  return document.querySelectorAll(
    `${CUSTOM_TAGNAME}[data-highlight-id='${id}']`
  );
}

function addClassByHighlightID(id, className) {
  const snippets = getSnippetsByHighlightID(id);
  snippets.forEach(el => {
    el.classList.add(className);
    const nestedSnippets = el.querySelectorAll(CUSTOM_TAGNAME);
    nestedSnippets.forEach(s => {
      s.setCSSVars(el.highlightColor, el.hoverColor);
      s.classList.add(className);
    });
  });
}

function removeClassByHighlightID(id, className) {
  const snippets = getSnippetsByHighlightID(id);
  snippets.forEach(el => {
    el.classList.remove(className);
    const nestedSnippets = el.querySelectorAll(CUSTOM_TAGNAME);
    nestedSnippets.forEach(s => {
      s.setCSSVars(s.highlightColor, s.hoverColor); // return to original colors
      s.classList.remove(className);
    });
  });
}

// actual highlighter stuff
const highliter = new Highliter({
  highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  hoverColor: DEFAULT_HOVER_COLOR,
  customTagName: CUSTOM_TAGNAME,
  exclude: []
});

let clicked = false;

highliter
  .on(Highliter.Events.HOVER, ({ highlightID }) => {
    if (!clicked) {
      addClassByHighlightID(highlightID, 'hl-hover');
    }
  })
  .on(Highliter.Events.HOVER_OUT, ({ highlightID }) => {
    if (!clicked) {
      removeClassByHighlightID(highlightID, 'hl-hover');
    }
  })
  .on(Highliter.Events.CLICKED_OUT, ({ highlightID }) => {
    removeClassByHighlightID(highlightID, 'hl-clicked');
    removeClassByHighlightID(highlightID, 'hl-hover');
    clicked = false;
  })
  .on(Highliter.Events.CLICKED, ({ highlightID }) => {
    const snippets = getSnippetsByHighlightID(highlightID);
    const firstSnippet = snippets[0];
    addClassByHighlightID(highlightID, 'hl-clicked');
    setPromptAt(firstSnippet);
    clicked = true;
  })
  .on(Highliter.Events.REMOVED, ({ highlightID }) => {
    store.remove(highlightID);
    console.log(`Removed all highlights with id ${highlightID}`);
  })
  .on(Highliter.Events.HIDE_MENU, () => {
    menu.hide();
  })
  .on(Highliter.Events.SHOW_MENU, () => {
    menu.show(highliter.currentRange);
  })
  .on(Highliter.Events.CREATED, ({ highlight }) => {
    store.save(highlight);
  })
  .on(Highliter.Events.ERROR_LOADING, ({ highlight, error }) => {
    console.error(`Failed loading highlight: `, highlight);
    console.error(`Reason: `, error);
  })
  .on(Highliter.Events.LOADED, ({ highlight }) => {
    console.log('Successfully loaded the following highlight: ', highlight);
  });

// get info from store
const hlInfos = store.getAll();
highliter.restoreHighlights(hlInfos);

// additional event listeners for demo
window.addEventListener('resize', () => {
  if (highliter.currentRange && menu.isVisible()) {
    menu.show(highliter.currentRange);
  }
});

document.addEventListener('click', e => {
  const { target } = e;

  if (target.classList.contains('del-prompt')) {
    const { id } = target.dataset;
    // remove highlight clicked
    removeClassByHighlightID(id, 'highlight-hover');
    highliter.remove(id);
    delPrompt.classList.add('hidden');
  } else if (!target.dataset.highlightId) {
    delPrompt.classList.add('hidden');
  }
});

document.querySelector('#clear_hl').addEventListener('click', () => {
  highliter.clearAll();
});

document.querySelector('#start_hl').addEventListener('click', () => {
  highliter.start();
});

document.querySelector('#pause_hl').addEventListener('click', () => {
  highliter.pause();
});

document.querySelector('#terminate_hl').addEventListener('click', () => {
  highliter.terminate();
});

// color stuff
function updateHighlightColor(picker) {
  highliter.setHighlightColor(picker.toHEXString());
}

const hlColorSelector = document.querySelector('#hl-color');
hlColorSelector.addEventListener('change', e => {
  updateHighlightColor(e.target.jscolor);
});

function updateHoverColor(picker) {
  highliter.setHoverColor(picker.toHEXString());
}

const hoverColorSelector = document.querySelector('#hover-color');
hoverColorSelector.addEventListener('change', e => {
  updateHoverColor(e.target.jscolor);
});

hlColorSelector.dataset.jscolor = `{
  value: '${DEFAULT_HIGHLIGHT_COLOR}'
}`;
hoverColorSelector.dataset.jscolor = `{
  value: '${DEFAULT_HOVER_COLOR}'
}`;

// eslint-disable-next-line no-undef
jscolor.trigger('change');
