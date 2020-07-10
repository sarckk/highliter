import { prepareHighlightSnippet } from './component/HighlightSnippet';
import { prepareMenu } from './component/HighlightMenu';
import * as store from './db/store';
import DOMPainter from './dompainter';
import { generateConfig } from './util/constants';
import { Events } from './util/events';
import { Moves } from './util/moves';
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
    this.menu = prepareMenu();
    this.currentSelection = null;
    this.options = generateConfig(config);
    this.currentHighlightColor = this.options.originalHighlightColor;
    this.currentHoverColor = this.options.originalHoverColor;
    this.DOMPainter = new DOMPainter(this.options);
    prepareHighlightSnippet(this.options);
    this._loadData();
    this.start();
  }

  start = () => {
    this._initDocumentListeners();
  };

  pause = () => {
    document.removeEventListener(Moves.MOUSE_UP, this._onSelection);
  };

  terminate = () => {
    document.removeEventListener(Moves.MOUSE_UP, this._onSelection);
    document.removeEventListener(Moves.CLICK, this._onMouseClick);
    document.removeEventListener(Moves.HIGHLIGHT, this._createHighlight);
    document.removeEventListener(Moves.HOVER, this._onSnippetHover);
    window.removeEventListener(Moves.RESIZE, this._onWindowResize);
    this.clearAll();
  };

  _loadData = () => {
    const highlights = store.getAll();

    if (highlights) {
      highlights.forEach(hl => {
        console.log('restoring highlight: ', hl);
        this.DOMPainter.restoreHighlight(hl);
      });
    }

    this.setHighlightColor(this.options.originalHighlightColor);
    this.setHoverColor(this.options.originalHoverColor);
    this.emit(Events.LOADED, { numLoaded: highlights.length });
  };

  _initDocumentListeners = () => {
    document.addEventListener(Moves.MOUSE_DOWN, () =>
      window.getSelection().removeAllRanges()
    );
    document.addEventListener(Moves.MOUSE_UP, this._onSelection);
    document.addEventListener(Moves.HOVER, this._onSnippetHover);
    document.addEventListener(Moves.CLICK, this._onMouseClick);
    document.addEventListener(Moves.HIGHLIGHT, this._createHighlight);
    window.addEventListener(Moves.RESIZE, this._onWindowResize);
  };

  _onWindowResize = () => {
    if (this.currentRange && this.menu.isVisible()) {
      this.menu.show(this.currentRange);
    }
  };

  _onSelection = () => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      // selection obj changes after cleaning so we keep the value in variable first
      const isBackwards = isSelectionBackwards(selection);
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

      console.log('range after cleaning: ', cleanedRange.cloneRange());

      this.currentRange = {
        range: cleanedRange,
        isSelectionBackwards: isBackwards
      };

      this.menu.show(this.currentRange);
    }
  };

  _onMouseClick = e => {
    const { target } = e;
    if (!isHighlightSnippet(target)) {
      if (this.prevClickedSnippetID) {
        this.emit(Events.CLICKED_OUT, {
          snippetID: this.prevClickedSnippetID
        });
        this.prevClickedSnippetID = null;
      }
      return;
    }

    const id = target.dataset.highlightId;

    if (this.prevClickedSnippetID === id) {
      return;
    }

    if (this.prevClickedSnippetID) {
      this.emit(Events.CLICKED_OUT, {
        snippetID: this.prevClickedSnippetID
      });
    }

    this.emit(Events.CLICKED, { snippetID: id });
    this.prevClickedSnippetID = id;
  };

  _createHighlight = () => {
    const snippetID = uuidv4();

    // serialize info first before DOM mutation by DOMPainter causes this.currentRange.range to change
    const highlightInfo = serialize(
      snippetID,
      this.currentRange.range,
      this.currentHighlightColor,
      this.currentHoverColor
    );

    const hlWraps = this.DOMPainter.highlight(
      snippetID,
      this.currentRange.range
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
      if (this.currentHoverSnippetID) {
        this.emit(Events.HOVER_OUT, { snippetID: this.currentHoverSnippetID });
        this.currentHoverSnippetID = null;
      }
      return;
    }
    const id = target.dataset.highlightId;

    if (this.currentHoverSnippetID === id) {
      return;
    }

    if (this.currentHoverSnippetID) {
      this.emit(Events.HOVER_OUT, { snippetID: this.currentHoverSnippetID });
    }

    this.emit(Events.HOVER, { snippetID: id });
    this.currentHoverSnippetID = id;
  };

  setHighlightColor = color => {
    this.currentHighlightColor = color;
    this.DOMPainter.setHighlightColor(color);
  };

  setHoverColor = color => {
    this.currentHoverColor = color;
    this.DOMPainter.setHoverColor(color);
  };

  remove = snippetID => {
    if (!snippetID) return;

    const snippets = document.querySelectorAll(
      `${this.options.snippetTagName}[data-highlight-id='${snippetID}']`
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
  };

  clearAll = () => {
    const removedIds = new Set();

    const allSnippets = document.querySelectorAll(
      `${this.options.snippetTagName}`
    );

    // remove all unique snippetIDs
    allSnippets.forEach(snippet => {
      const id = snippet.dataset.highlightId;
      if (!removedIds.has(id)) {
        this.remove(id);
        removedIds.add(id);
      }
    });
  };
}

export default Highlighter;
