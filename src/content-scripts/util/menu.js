/* eslint-disable no-undef */
import { BOTTOM_GAP, TOP_GAP, POINTER_HEIGHT, COLORS } from './constants';
import { addInsertionMarker } from './dom';

const colors = [...COLORS];

function createOption(color) {
  return `<div class='highlight-option highlight-option-${color}' data-color=${color}></div>`;
}

function prepareMenu() {
  const menu = document.createElement('div');
  menu.classList.add('highlight-menu');

  const shadow = menu.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <div class='highlight-menu-container'>
      <link rel="stylesheet" href="${chrome.runtime.getURL(
        'src/styles/menu.css'
      )}">
      <div class='highlight-menu-pointer'></div>
      <div class='highlight-menu-options'>
          ${colors.map(createOption).join('')}
      </div>
    </div>
  `;

  document.body.append(menu);
}

function calcMenuPosition(menu, selectionRange) {
  let positionAdjusted = false;
  const { range, isBackwards } = selectionRange;

  /* First get the insertion marker placed at where it ought to be
      then do re-adjust later as necessary */
  let marker = addInsertionMarker(range, isBackwards);
  let markerCoords = marker.getBoundingClientRect();

  const maxTopOffset =
    document.documentElement.clientHeight - menu.offsetHeight - POINTER_HEIGHT;

  const topOffsetBackwards = markerCoords.top - menu.offsetHeight - BOTTOM_GAP;
  const topOffsetForwards = markerCoords.bottom + TOP_GAP - POINTER_HEIGHT;

  const windowRelativeTopOffset = isBackwards
    ? topOffsetBackwards
    : topOffsetForwards;

  let topOffset;

  if (windowRelativeTopOffset < 0 && isBackwards) {
    marker.remove();
    marker = addInsertionMarker(range, !isBackwards);
    markerCoords = marker.getBoundingClientRect();
    topOffset = markerCoords.bottom + TOP_GAP - POINTER_HEIGHT;

    positionAdjusted = true;
  } else if (windowRelativeTopOffset > maxTopOffset && !isBackwards) {
    marker.remove();
    marker = addInsertionMarker(range, !isBackwards);
    markerCoords = marker.getBoundingClientRect();
    topOffset = markerCoords.top - menu.offsetHeight - BOTTOM_GAP;

    positionAdjusted = true;
  } else {
    // no change in position of menu, proceed as usual
    topOffset = windowRelativeTopOffset;
  }

  // adjust for absolute positioning
  topOffset += window.pageYOffset;

  // Set left offset so that menu is always in view
  let leftOffset = markerCoords.left - menu.offsetWidth / 2;

  const maxLeftOffset = document.documentElement.clientWidth + menu.offsetWidth;

  if (leftOffset < 0) {
    leftOffset = 0;
  }
  if (leftOffset > maxLeftOffset) {
    leftOffset = maxLeftOffset;
  }

  marker.remove(); // remove temp marker

  return { leftOffset, topOffset, positionAdjusted };
}

function hideMenu() {
  const menu = document.querySelector('.highlight-menu');
  const pointer = menu.shadowRoot.querySelector('.highlight-menu-pointer');

  menu.style.display = 'none';
  menu.style.left = '';
  menu.style.top = '';
  pointer.classList.remove('pointer-bottom');
  pointer.classList.remove('pointer-top');
}

function showMenu(selectionRange) {
  const menu = document.querySelector('.highlight-menu');
  const pointer = menu.shadowRoot.querySelector('.highlight-menu-pointer');

  menu.style.display = 'block'; // initialize menu here first because we need to get its offsetHeight and width for calcMenuPosition()

  const { leftOffset, topOffset, positionAdjusted } = calcMenuPosition(
    menu,
    selectionRange
  );

  menu.style.left = `${leftOffset}px`;
  menu.style.top = `${topOffset}px`;

  const { isBackwards } = selectionRange;

  if (positionAdjusted) {
    pointer.classList.add(!isBackwards ? 'pointer-bottom' : 'pointer-top');
  } else {
    pointer.classList.add(isBackwards ? 'pointer-bottom' : 'pointer-top');
  }

  const optionList = menu.shadowRoot.querySelectorAll('.highlight-option');
  console.log('optionList: ', optionList);

  optionList.forEach(option => {
    // eslint-disable-next-line no-param-reassign
    option.onclick = () => {
      console.log('Event dispatched: ', option.dataset.color);
      option.dispatchEvent(
        new CustomEvent('highlight', {
          bubbles: true,
          composed: true,
          detail: {
            color: option.dataset.color
          }
        })
      );
    };
  });

  return menu;
}

export { prepareMenu, showMenu, hideMenu };
