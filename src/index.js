/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable no-multi-assign */
import { v4 as uuidv4 } from 'uuid';
import { prepareHighlightSnippet } from './component/HighlightSnippet';
import { prepareMenu } from './component/HighlightMenu';
import * as store from './db/store';
import DOMPainter from './dompainter';
import {
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_HIGHLIGHT_HOVER_COLOR
} from './util/constants';
import { Events } from './util/events';
import EventEmitter from './util/emitter';
import { isSelectionBackwards, cleanRange, serialize } from './util/selection';

class Highlighter extends EventEmitter {
  static get EVENTS() {
    return Events;
  }

  constructor(config = {}) {
    super();
    prepareHighlightSnippet();
    this.menu = prepareMenu();
    this.currentSelection = null;
    this.DOMPainter = new DOMPainter(this.highlightColor, this.hoverColor);
    this._generateDefaultConfig(config);
  }

  _generateDefaultConfig(config) {
    this.highlightColor = this.originHlColor =
      config.highlightColor || DEFAULT_HIGHLIGHT_COLOR;
    this.hoverColor = this.originHoverColor =
      config.hoverColor || DEFAULT_HIGHLIGHT_HOVER_COLOR;
  }

  init = () => {
    this._loadData();
    this._initDocumentListeners();
  };

  _loadData = () => {
    const highlights = store.getAll();

    if (highlights) {
      highlights.forEach(hl => {
        this.DOMPainter.restoreHighlight(hl);
      });
    }

    this.setHighlightColor(this.originHlColor);
    this.setHoverColor(this.originHoverColor);
    this.emit(Events.LOADED, { numLoaded: highlights.length });
  };

  _initDocumentListeners = () => {
    document.body.addEventListener('mouseup', this._onSelection);
    document.body.addEventListener('click', this._onMouseClick);
    document.body.addEventListener('highlight', this._createHighlight);
    document.body.addEventListener('mouseover', this._onSnippetHover);
  };

  _onSelection = () => {
    const selection = window.getSelection();
    // selection obj changes after cleaning so we keep the value in variable first
    const isBackwards = isSelectionBackwards(selection);

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        if (this.menu.isVisible()) {
          this.menu.hide();
        }
        return;
      }

      const cleanedRange = cleanRange(range);
      if (!cleanedRange) {
        if (this.menu.isVisible()) {
          this.menu.hide();
        }
        return;
      }

      this._currentRange = cleanedRange;
      console.log('range after cleaning: ', this._currentRange.cloneRange());
      this.menu.show(this._currentRange, isBackwards);
    }
  };

  _onMouseClick = e => {
    const { target } = e;
    if (!target.dataset.highlightId) {
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

    // serialize info first before DOM mutation by DOMPainter causes this._currentRange to change
    const highlightInfo = serialize(
      snippetID,
      this._currentRange,
      this.highlightColor,
      this.hoverColor
    );

    const hlWraps = this.DOMPainter.highlight(snippetID, this._currentRange);
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
    if (!target.dataset.highlightId) {
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
    this.highlightColor = color;
    this.DOMPainter.setHighlightColor(color);
  }

  setHoverColor(color) {
    this.hoverColor = color;
    this.DOMPainter.setHoverColor(color);
  }

  clearAll() {
    store.clearAll();
  }

  remove(snippetID) {
    if (!snippetID) return;

    const snippets = document.querySelectorAll(
      `.highlight-snippet[data-highlight-id='${snippetID}']`
    );

    if (snippets.length === 0) {
      return;
    }

    snippets.forEach(snippet => {
      const parent = snippet.parentElement;
      parent.insertBefore(snippet.firstChild, snippet);
      parent.removeChild(snippet);
      parent.normalize();
    });

    store.remove(snippetID);
    this.emit(Events.REMOVED, { snippetID });
  }
}

export default Highlighter;
