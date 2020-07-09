/* eslint-disable no-unused-vars */
import Highlighter from './src/index';

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

// single del prompt
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

const DEFAULT_HIGHLIGHT_COLOR = '#FBFF75';
const DEFAULT_HOVER_COLOR = '#F9D186';
const SNIPPET_TAGNAME = 'custom-elem';

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

const highlighter = new Highlighter({
  highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  hoverColor: DEFAULT_HOVER_COLOR,
  snippetTagName: SNIPPET_TAGNAME
});
highlighter.init();

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
    console.log(`Removed all highlights with id ${snippetID}`);
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

// set defaults
hlColorSelector.dataset.jscolor = `{
  value: '${DEFAULT_HIGHLIGHT_COLOR}'
}`;
hoverColorSelector.dataset.jscolor = `{
  value: '${DEFAULT_HOVER_COLOR}'
}`;

// eslint-disable-next-line no-undef
jscolor.trigger('change');
