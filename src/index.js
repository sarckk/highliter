/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable no-multi-assign */
import { prepareHighlightSnippet } from './component/HighlightSnippet';
import { prepareMenu } from './component/HighlightMenu';
import * as store from './db/store';
import DOMPainter from './dompainter';
import { generateConfig } from './util/constants';
import { Events } from './util/events';
import EventEmitter from './util/emitter';
import { isHighlightSnippet } from './util/dom';
import { isSelectionBackwards, cleanRange, serialize } from './util/selection';
import { uuidv4 } from './util/uuid';

class Highlighter extends EventEmitter {
  static get EVENTS() {
    return Events;
  }

  constructor(config = {}) {
    super();
    this._menu = prepareMenu();
    this._currentSelection = null;
    this._options = generateConfig(config);
    this._currentHighlightColor = this._options.originalHighlightColor;
    this._currentHoverColor = this._options.originalHoverColor;
    this.DOMPainter = new DOMPainter(this._options);
    prepareHighlightSnippet(this._options);
  }

  init = () => {
    this._loadData();
    this._initDocumentListeners();
  };

  _loadData = () => {
    const highlights = store.getAll();

    if (highlights) {
      highlights.forEach(hl => {
        console.log('restoring hl: ', hl);
        this.DOMPainter.restoreHighlight(hl);
      });
    }

    this.setHighlightColor(this._options.originalHighlightColor);
    this.setHoverColor(this._options.originalHoverColor);
    this.emit(Events.LOADED, { numLoaded: highlights.length });
  };

  _initDocumentListeners = () => {
    document.body.addEventListener('mousedown', () =>
      window.getSelection().removeAllRanges()
    );
    document.body.addEventListener('mouseup', this._onSelection);
    document.body.addEventListener('click', this._onMouseClick);
    document.body.addEventListener('highlight', this._createHighlight);
    document.body.addEventListener('mouseover', this._onSnippetHover);
    window.addEventListener('resize', this._onWindowResize);
  };

  _onWindowResize = () => {
    if (this._currentRange && this._menu.isVisible()) {
      this._menu.show(this._currentRange);
    }
  };

  _onSelection = () => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      // selection obj changes after cleaning so we keep the value in variable first
      const isBackwards = isSelectionBackwards(selection);
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        if (this._menu.isVisible()) {
          this._menu.hide();
        }
        return;
      }

      const cleanedRange = cleanRange(range);
      if (!cleanedRange) {
        if (this._menu.isVisible()) {
          this._menu.hide();
        }
        return;
      }

      console.log('range after cleaning: ', cleanedRange.cloneRange());

      this._currentRange = {
        range: cleanedRange,
        isSelectionBackwards: isBackwards
      };

      this._menu.show(this._currentRange);
    }
  };

  _onMouseClick = e => {
    const { target } = e;
    if (!isHighlightSnippet(target)) {
      if (this._prevClickedSnippetID) {
        this.emit(Events.CLICKED_OUT, {
          snippetID: this._prevClickedSnippetID
        });
        this._prevClickedSnippetID = null;
      }
      return;
    }

    const id = target.dataset.highlightId;

    if (this._prevClickedSnippetID === id) {
      return;
    }

    if (this._prevClickedSnippetID) {
      this.emit(Events.CLICKED_OUT, {
        snippetID: this._prevClickedSnippetID
      });
    }

    this.emit(Events.CLICKED, { snippetID: id });
    this._prevClickedSnippetID = id;
  };

  _createHighlight = () => {
    const snippetID = uuidv4();

    // serialize info first before DOM mutation by DOMPainter causes this._currentRange.range to change
    const highlightInfo = serialize(
      snippetID,
      this._currentRange.range,
      this._currentHighlightColor,
      this._currentHoverColor
    );

    const hlWraps = this.DOMPainter.highlight(
      snippetID,
      this._currentRange.range
    );
    if (hlWraps.length === 0) {
      console.error('Invalid highlight selection - no text nodes selected');
      return;
    }

    console.log('Saving the following details: ', highlightInfo);
    store.save(highlightInfo);
    this.emit(Events.CREATED, { highlightInfo });
  };

  _onSnippetHover = e => {
    const { target } = e;
    if (!isHighlightSnippet(target)) {
      if (this._currentHoverSnippetID) {
        this.emit(Events.HOVER_OUT, { snippetID: this._currentHoverSnippetID });
        this._currentHoverSnippetID = null;
      }
      return;
    }
    const id = target.dataset.highlightId;

    if (this._currentHoverSnippetID === id) {
      return;
    }

    if (this._currentHoverSnippetID) {
      this.emit(Events.HOVER_OUT, { snippetID: this._currentHoverSnippetID });
    }

    this.emit(Events.HOVER, { snippetID: id });
    this._currentHoverSnippetID = id;
  };

  setHighlightColor(color) {
    this._currentHighlightColor = color;
    this.DOMPainter.setHighlightColor(color);
  }

  setHoverColor(color) {
    this._currentHoverColor = color;
    this.DOMPainter.setHoverColor(color);
  }

  clearAll() {
    store.clearAll();
  }

  remove(snippetID) {
    if (!snippetID) return;

    const snippets = document.querySelectorAll(
      `${this._options.snippetTagName}[data-highlight-id='${snippetID}']`
    );

    if (snippets.length === 0) {
      return;
    }

    snippets.forEach(snippet => {
      const parent = snippet.parentElement;

      // convert to pure array since changes to DOM by insertBefore will cause
      // not all childNode in childNodes to be iterated over
      Array.from(snippet.childNodes).forEach(child => {
        parent.insertBefore(child, snippet);
      });
      parent.removeChild(snippet);
      parent.normalize();
    });

    store.remove(snippetID);
    this.emit(Events.REMOVED, { snippetID });
  }
}

export default Highlighter;
