import { v4 as uuidv4 } from 'uuid';

export default class Highlighter {
  constructor() {
    throw new Error('Cannot instantiate, this is a singleton!');
  }

  static highlightFromSelection(selectedRanges, color) {
    const HighlightSnippet = customElements.get('highlight-snippet');
    const uuid = uuidv4();

    selectedRanges.forEach(range =>
      range.surroundContents(new HighlightSnippet(color, uuid))
    );
  }
}
