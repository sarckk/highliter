import { highlightFromStore } from '../util/highlight';

/* eslint-disable no-undef */
export default class Store {
  constructor(pageUrl) {
    this.key = `highlights-${pageUrl}`;
  }

  clearAll() {
    chrome.storage.sync.set({ [this.key]: [] });
  }

  loadHighlights() {
    chrome.storage.sync.get({ [this.key]: [] }, result => {
      const pageHighlights = result[this.key];
      pageHighlights.forEach(highlightInfo => {
        console.log('from store: ', highlightInfo);
        highlightFromStore(highlightInfo);
      });
    });
  }

  saveHighlight(highlightInfo, color, id) {
    chrome.storage.sync.get({ [this.key]: [] }, result => {
      const pageHighlights = result[this.key]; // array of highlights

      const newHighlight = {
        ...highlightInfo,
        color,
        id
      };

      if (pageHighlights.some(highlight => highlight.id === id)) {
        pageHighlights.map(highlight =>
          highlight.id === id ? newHighlight : highlight
        );
      } else {
        pageHighlights.push(newHighlight);
      }

      chrome.storage.sync.set({ [this.key]: pageHighlights });
    });
  }
}
