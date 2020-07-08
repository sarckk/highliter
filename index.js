/* eslint-disable no-unused-vars */
import Highlighter from './src/index';

function getSnippetsByDataID(id) {
  return document.querySelectorAll(
    `.highlight-snippet[data-highlight-id='${id}']`
  );
}

function addClassByDataID(id, className) {
  const snippets = getSnippetsByDataID(id);
  snippets.forEach(el => {
    el.classList.add(className);
  });
}

function removeClassByDataID(id, className) {
  const snippets = getSnippetsByDataID(id);
  snippets.forEach(el => {
    el.classList.remove(className);
  });
}

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

const HIGHLIGHT_COLOR = '#FBFF75';
const HOVER_COLOR = '#F4F93A';

const highlighter = new Highlighter({
  highlightColor: HIGHLIGHT_COLOR,
  hoverColor: HOVER_COLOR
});
highlighter.init();

highlighter
  .on(Highlighter.EVENTS.HOVER, ({ snippetID }) => {
    addClassByDataID(snippetID, 'highlight-hover');
  })
  .on(Highlighter.EVENTS.HOVER_OUT, ({ snippetID }) => {
    removeClassByDataID(snippetID, 'highlight-hover');
  })
  .on(Highlighter.EVENTS.CLICKED_OUT, ({ snippetID }) => {
    removeClassByDataID(snippetID, 'highlight-clicked');
  })
  .on(Highlighter.EVENTS.CLICKED, ({ snippetID }) => {
    const snippets = getSnippetsByDataID(snippetID);
    const firstSnippet = snippets[0];
    addClassByDataID(snippetID, 'highlight-clicked');
    setPromptAt(firstSnippet);
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
  } else if (!target.classList.contains('highlight-snippet')) {
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
  value: '${HIGHLIGHT_COLOR}'
}`;
hoverColorSelector.dataset.jscolor = `{
  value: '${HOVER_COLOR}'
}`;

// eslint-disable-next-line no-undef
jscolor.trigger('change');
