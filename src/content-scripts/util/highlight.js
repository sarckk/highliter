import { v4 as uuidv4 } from 'uuid';
import SelectionRange from '../model/SelectionRange';
import { getHighlightRanges } from './selection';
import { getCommonEnclosingElement } from './dom';

function highlightFromRange(selectionRange, color, id) {
  const HighlightSnippet = window.customElements.get('highlight-snippet');
  const uuid = id || uuidv4();
  const selectedRanges = getHighlightRanges(selectionRange);

  selectedRanges.forEach(range => {
    const snippet = new HighlightSnippet(color, uuid);
    document.body.append(snippet); // add to document first to trigger connectedCallback()
    range.surroundContents(snippet);
  });

  return uuid;
}

function highlightFromStore({
  start,
  end,
  isBackwards,
  normalizeElemChanged,
  text,
  color,
  id
}) {
  const range = document.createRange();

  const startContainerParent = document.body.querySelectorAll(start.parentTag)[
    start.parentOffset
  ];

  const endContainerParent = document.body.querySelectorAll(end.parentTag)[
    end.parentOffset
  ];

  // now normalize the relevant parent so that we get the initial .childNodes when the highlight range was
  // serialized. This is done because when we are generating the highlights directly from store,
  // there is no normalizing done to get rid of the whitespace characters automatically put in by HTML
  // between inline elements (such as between our custom highlight-snippet element and anchor element)
  if (isBackwards) {
    startContainerParent.normalize();
    if (normalizeElemChanged) endContainerParent.normalize();
  } else {
    endContainerParent.normalize();
    if (normalizeElemChanged) startContainerParent.normalize();
  }

  const startContainer = startContainerParent.childNodes[start.textNodeOffset];
  const endContainer = endContainerParent.childNodes[end.textNodeOffset];

  range.setStart(startContainer, start.innerOffset);
  range.setEnd(endContainer, end.innerOffset);

  const commonEnclosingElement = getCommonEnclosingElement(
    range.commonAncestorContainer
  );

  const selectionRange = new SelectionRange(
    range,
    text,
    commonEnclosingElement,
    isBackwards,
    null
  );

  highlightFromRange(selectionRange, color, id);
}

export { highlightFromRange, highlightFromStore };
