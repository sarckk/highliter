function getSnippetsByDataId(id) {
  return document.querySelectorAll(`[data-highlight-id='${id}']`);
}

export { getSnippetsByDataId };
