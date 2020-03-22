import { v4 as uuidv4 } from 'uuid';

function highlight(selectedRanges, color) {
  const HighlightSnippet = window.customElements.get('highlight-snippet');
  const uuid = uuidv4();

  selectedRanges.forEach(range => {
    const snippet = new HighlightSnippet(color, uuid);
    document.body.append(snippet); // add to document first to trigger connectedCallback()
    range.surroundContents(snippet);
  });
}

export { highlight };
