function setAll(store) {
  localStorage.setItem('highlights', JSON.stringify(store));
}

function removeAll() {
  setAll([]);
}

function getAll() {
  const highlights = localStorage.getItem('highlights');

  if (!highlights) {
    return [];
  }

  let parsedHighlights;

  try {
    parsedHighlights = JSON.parse(highlights);
  } catch (err) {
    console.error('Could not get highlights');
    removeAll();
    return [];
  }

  return parsedHighlights;
}

function get(id) {
  const records = getAll();
  const matchedRecords = records.filter(r => r.id === id);

  if (matchedRecords.length === 0) {
    return null;
  }

  return matchedRecords;
}

function save(highlight) {
  let highlights = getAll();
  if (!highlights) {
    highlights = [];
  }

  if (highlights.some(hl => hl.id === highlight.id)) {
    highlights.map(hl => (hl.id === highlight.id ? highlight : hl));
  } else {
    highlights.push(highlight);
  }

  setAll(highlights);
}

function remove(id) {
  let highlights = getAll();
  if (!highlights) {
    highlights = [];
  }
  setAll(highlights.filter(hl => hl.id !== id));
}

export { setAll, removeAll, get, getAll, save, remove };
