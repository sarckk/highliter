import HighlightSnippet from "../HighlightSnippet";

export default class Highlighter {
  constructor() {
    throw new Error("Cannot instantiate, this is a singleton!");
  }

  static highlightFromSelection(selectedRanges, color) {
    const HighlightSnippet = customElements.get("highlight-snippet");

    for (let range of selectedRanges) {
      range.surroundContents(new HighlightSnippet(color));
    }
  }
}
