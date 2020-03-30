/* eslint-disable no-undef */
import {
  BOTTOM_GAP,
  TOP_GAP,
  POINTER_HEIGHT,
  ZERO_WIDTH_SPACE,
  COLOR_HEX,
  COLOR_NAMES
} from './constants';

const colorHex = [...COLOR_HEX];

function createOption(color) {
  const colorName = COLOR_NAMES[colorHex.indexOf(color)];
  return `<div class='highlight-option highlight-option-${colorName}' data-color=${color}></div>`;
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
          ${colorHex.map(createOption).join('')}
      </div>
    </div>
  `;

  document.body.append(menu);
}

function getInsertionMarker(ranges, isBackwards) {
  const range = isBackwards ? ranges[0] : ranges.slice(-1)[0];

  const tempMarker = document.createElement('span');

  tempMarker.innerHTML = ZERO_WIDTH_SPACE; // zero-width character
  tempMarker.style.border = '1px solid red';

  const rangeCopy = range.cloneRange();
  rangeCopy.collapse(isBackwards); // if isBackwards is true, collapse(true) collapses to the start
  rangeCopy.insertNode(tempMarker);

  return tempMarker;
}

function calcMenuPosition(menu, range) {
  const { isBackwards, selectedRanges } = range;
  let positionAdjusted = false;

  /* First get the insertion marker placed at where it ought to be
      then do re-adjust later as necessary */
  let marker = getInsertionMarker(selectedRanges, isBackwards);
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
    range.normalize();
    marker = getInsertionMarker(selectedRanges, !isBackwards);
    markerCoords = marker.getBoundingClientRect();
    topOffset = markerCoords.bottom + TOP_GAP - POINTER_HEIGHT;

    positionAdjusted = true;
  } else if (windowRelativeTopOffset > maxTopOffset && !isBackwards) {
    marker.remove();
    range.normalize();
    marker = getInsertionMarker(selectedRanges, !isBackwards);
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

  // remove temp marker
  marker.remove();

  return { leftOffset, topOffset, positionAdjusted };
}

function showMenu(range) {
  const menu = document.querySelector('.highlight-menu');
  const pointer = menu.shadowRoot.querySelector('.highlight-menu-pointer');

  menu.style.display = 'block';

  const { leftOffset, topOffset, positionAdjusted } = calcMenuPosition(
    menu,
    range
  );

  const { isBackwards } = range;

  menu.style.left = `${leftOffset}px`;
  menu.style.top = `${topOffset}px`;

  if (positionAdjusted) {
    pointer.classList.add(!isBackwards ? 'pointer-bottom' : 'pointer-top');
    range.changeNormalizeElem();
  } else {
    pointer.classList.add(isBackwards ? 'pointer-bottom' : 'pointer-top');
  }

  const optionList = menu.shadowRoot.querySelectorAll('.highlight-option');

  optionList.forEach(option => {
    // eslint-disable-next-line no-param-reassign
    option.onclick = () => {
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

function hideMenu() {
  const menu = document.querySelector('.highlight-menu');
  const pointer = menu.shadowRoot.querySelector('.highlight-menu-pointer');

  menu.style.display = 'none';
  menu.style.left = '';
  menu.style.top = '';
  pointer.classList.remove('pointer-bottom');
  pointer.classList.remove('pointer-top');
}

export { prepareMenu, showMenu, hideMenu };
