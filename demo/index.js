// eslint-disable-next-line import/no-unresolved
import jscolor from 'jscolor';
import Highlighter from '../src/index';
import './index.css';
import * as store from './store';
import { prepareMenu } from './menu';

// create menu
const menu = prepareMenu();

// helper function
function getRealPos(el) {
  let _el = el;
  let left = 0;
  let top = 0;
  do {
    left += _el.offsetLeft;
    top += _el.offsetTop;
    _el = _el.offsetParent;
  } while (_el);

  return { left, top };
}

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
const SNIPPET_TAGNAME = 'custom-elem';

// dom methods
function getSnippetsByDataID(id) {
  return document.querySelectorAll(
    `${SNIPPET_TAGNAME}[data-highlight-id='${id}']`
  );
}

function addClassByDataID(id, className) {
  const snippets = getSnippetsByDataID(id);
  snippets.forEach(el => {
    el.classList.add(className);
    const nestedSnippets = el.querySelectorAll(SNIPPET_TAGNAME);
    nestedSnippets.forEach(s => {
      s.setCSSVars(el.highlightColor, el.hoverColor);
      s.classList.add(className);
    });
  });
}

function removeClassByDataID(id, className) {
  const snippets = getSnippetsByDataID(id);
  snippets.forEach(el => {
    el.classList.remove(className);
    const nestedSnippets = el.querySelectorAll(SNIPPET_TAGNAME);
    nestedSnippets.forEach(s => {
      s.setCSSVars(s.highlightColor, s.hoverColor); // return to original colors
      s.classList.remove(className);
    });
  });
}

// actual highlighter stuff
const highlighter = new Highlighter({
  highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  hoverColor: DEFAULT_HOVER_COLOR,
  snippetTagName: SNIPPET_TAGNAME,
  exclude: ['li']
});

let clicked = false;

highlighter
  .on(Highlighter.EVENTS.HOVER, ({ snippetID }) => {
    if (!clicked) {
      addClassByDataID(snippetID, 'hl-hover');
    }
  })
  .on(Highlighter.EVENTS.HOVER_OUT, ({ snippetID }) => {
    if (!clicked) {
      removeClassByDataID(snippetID, 'hl-hover');
    }
  })
  .on(Highlighter.EVENTS.CLICKED_OUT, ({ snippetID }) => {
    removeClassByDataID(snippetID, 'hl-clicked');
    removeClassByDataID(snippetID, 'hl-hover');
    clicked = false;
  })
  .on(Highlighter.EVENTS.CLICKED, ({ snippetID }) => {
    const snippets = getSnippetsByDataID(snippetID);
    const firstSnippet = snippets[0];
    addClassByDataID(snippetID, 'hl-clicked');
    setPromptAt(firstSnippet);
    clicked = true;
  })
  .on(Highlighter.EVENTS.REMOVED, ({ snippetID }) => {
    store.remove(snippetID);
    console.log(`Removed all highlights with id ${snippetID}`);
  })
  .on(Highlighter.EVENTS.HIDE_MENU, () => {
    menu.hide();
  })
  .on(Highlighter.EVENTS.SHOW_MENU, () => {
    menu.show(highlighter.currentRange);
  })
  .on(Highlighter.EVENTS.CREATED, ({ highlightInfo }) => {
    store.save(highlightInfo);
  })
  .on(Highlighter.EVENTS.ERROR_LOADING, ({ highlight, error }) => {
    console.error(`Failed loading highlight: `, highlight);
    console.error(`Reason: `, error);
  })
  .on(Highlighter.EVENTS.LOADED, ({ highlight }) => {
    console.log('Successfully loaded the following highlight: ', highlight);
  });

// get info from store
const hlInfos = store.getAll();
highlighter.restoreHighlights(hlInfos);

// additional event listeners for demo
window.addEventListener('resize', () => {
  if (highlighter.currentRange && menu.isVisible()) {
    menu.show(highlighter.currentRange);
  }
});

document.addEventListener('click', e => {
  const { target } = e;

  if (target.classList.contains('del-prompt')) {
    const { id } = target.dataset;
    // remove highlight clicked
    removeClassByDataID(id, 'highlight-hover');
    highlighter.remove(id);
    delPrompt.classList.add('hidden');
  } else if (!target.dataset.highlightId) {
    delPrompt.classList.add('hidden');
  }
});

document.querySelector('#clear_hl').addEventListener('click', () => {
  highlighter.clearAll();
});

document.querySelector('#start_hl').addEventListener('click', () => {
  highlighter.start();
});

document.querySelector('#pause_hl').addEventListener('click', () => {
  highlighter.pause();
});

document.querySelector('#terminate_hl').addEventListener('click', () => {
  highlighter.terminate();
});

// color stuff
function updateHighlightColor(picker) {
  highlighter.setHighlightColor(picker.toHEXString());
}

const hlColorSelector = document.querySelector('#hl-color');
hlColorSelector.addEventListener('change', e => {
  updateHighlightColor(e.target.jscolor);
});

function updateHoverColor(picker) {
  highlighter.setHoverColor(picker.toHEXString());
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
