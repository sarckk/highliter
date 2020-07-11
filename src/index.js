import { prepareHighlightSnippet } from './highlight-snippet';
import DOMPainter from './dom.painter';
import { generateConfig } from './util/constants';
import { Events } from './util/events';
import { touchDevice, Moves } from './util/moves';
import EventEmitter from './util/emitter';
import { isHighlightSnippet } from './util/dom';
import {
  getCurrentSelection,
  isSelectionBackwards,
  cleanRange,
  serialize
} from './util/selection';
import { uuidv4 } from './util/uuid';

class Highliter extends EventEmitter {
  static Events = Events;

  constructor(config = {}) {
    super();
    this.options = generateConfig(config);
    this.currentHighlightColor = this.options.originalHighlightColor;
    this.currentHoverColor = this.options.originalHoverColor;
    this._DOMPainter = new DOMPainter(this.options);
    prepareHighlightSnippet(this.options);
    this.start();
  }

  start = () => {
    this._initDocumentListeners();
  };

  pause = () => {
    document.removeEventListener(Moves.MOUSE_UP, this._onSelection);
    document.removeEventListener(Moves.HIGHLIGHT, this._createHighlight);
  };

  terminate = () => {
    document.removeEventListener(Moves.MOUSE_UP, this._onSelection);
    document.removeEventListener(Moves.CLICK, this._onMouseClick);
    document.removeEventListener(Moves.HIGHLIGHT, this._createHighlight);
    document.removeEventListener(Moves.HOVER, this._onSnippetHover);
    document.removeEventListener(
      Moves.SELECTION_CHANGE,
      this._onSelectionChange
    );
    this.clearAll();
  };

  restoreHighlights(highlights) {
    if (highlights) {
      highlights.forEach(hl => {
        try {
          this._DOMPainter.restoreHighlight(hl);
        } catch (err) {
          this.emit(Events.ERROR_LOADING, {
            highlight: hl,
            error: err.message
          });
          return;
        }
        this.emit(Events.LOADED, { highlight: hl });
      });
    }
    this.setHighlightColor(this.options.originalHighlightColor);
    this.setHoverColor(this.options.originalHoverColor);
  }

  _initDocumentListeners = () => {
    if (touchDevice) {
      document.addEventListener(
        Moves.SELECTION_CHANGE,
        this._onSelectionChange
      );
    } else {
      document.addEventListener(
        Moves.MOUSE_DOWN,
        () => window.getSelection() && window.getSelection().removeAllRanges()
      );
    }
    document.addEventListener(Moves.MOUSE_UP, this._onSelection);
    document.addEventListener(Moves.HOVER, this._onSnippetHover);
    document.addEventListener(Moves.CLICK, this._onMouseClick);
    document.addEventListener(Moves.HIGHLIGHT, this._createHighlight);
  };

  _onSelectionChange = () => {
    const selection = getCurrentSelection();
    if (selection === null) {
      this.emit(Events.HIDE_MENU);
    }
  };

  _onSelection = () => {
    const selection = getCurrentSelection();
    if (selection === null) {
      this.emit(Events.HIDE_MENU);
      return;
    }

    // selection obj changes after cleaning so we keep the value in variable first
    const isBackwards = isSelectionBackwards(selection);
    const range = selection.getRangeAt(0);

    const cleanedRange = cleanRange(range);
    if (!cleanedRange) {
      this.emit(Events.HIDE_MENU);
      return;
    }

    this.currentRange = {
      range: cleanedRange,
      isSelectionBackwards: isBackwards
    };

    this.emit(Events.SHOW_MENU);
  };

  _onMouseClick = e => {
    const { target } = e;
    if (!isHighlightSnippet(target)) {
      if (this.prevClickedHighlightID) {
        this.emit(Events.CLICKED_OUT, {
          highlightID: this.prevClickedHighlightID
        });
        this.prevClickedHighlightID = null;
      }
      return;
    }

    const id = target.dataset.highlightId;

    if (this.prevClickedHighlightID === id) {
      return;
    }

    if (this.prevClickedHighlightID) {
      this.emit(Events.CLICKED_OUT, {
        highlightID: this.prevClickedHighlightID
      });
    }

    this.emit(Events.CLICKED, { highlightID: id });
    this.prevClickedHighlightID = id;
  };

  _createHighlight = () => {
    const highlightID = uuidv4();

    // serialize info first before DOM mutation by DOMPainter causes this.currentRange.range to change
    const highlight = serialize(
      highlightID,
      this.currentRange.range,
      this.currentHighlightColor,
      this.currentHoverColor
    );

    const hlWraps = this._DOMPainter.highlight(
      highlightID,
      this.currentRange.range
    );

    if (hlWraps.length === 0) {
      console.error('Invalid highlight selection - no text nodes selected');
      return;
    }

    this.emit(Events.CREATED, { highlight });
    this.emit(Events.HIDE_MENU);
  };

  _onSnippetHover = e => {
    const { target } = e;
    if (!isHighlightSnippet(target)) {
      if (this.currentHoverHighlightID) {
        this.emit(Events.HOVER_OUT, {
          highlightID: this.currentHoverHighlightID
        });
        this.currentHoverHighlightID = null;
      }
      return;
    }
    const id = target.dataset.highlightId;

    if (this.currentHoverHighlightID === id) {
      return;
    }

    if (this.currentHoverHighlightID) {
      this.emit(Events.HOVER_OUT, {
        highlightID: this.currentHoverHighlightID
      });
    }

    this.emit(Events.HOVER, { highlightID: id });
    this.currentHoverHighlightID = id;
  };

  setHighlightColor = color => {
    this.currentHighlightColor = color;
    this._DOMPainter.setHighlightColor(color);
  };

  setHoverColor = color => {
    this.currentHoverColor = color;
    this._DOMPainter.setHoverColor(color);
  };

  remove = highlightID => {
    if (!highlightID) return;

    const snippets = document.querySelectorAll(
      `${this.options.customTagName}[data-highlight-id='${highlightID}']`
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

    this.emit(Events.REMOVED, { highlightID });
  };

  clearAll = () => {
    const removedIds = new Set();

    const allSnippets = document.querySelectorAll(
      `${this.options.customTagName}`
    );

    // remove all unique highlightIDs
    allSnippets.forEach(snippet => {
      const id = snippet.dataset.highlightId;
      if (!removedIds.has(id)) {
        this.remove(id);
        removedIds.add(id);
      }
    });
  };
}

export default Highliter;
