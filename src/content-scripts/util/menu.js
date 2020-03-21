/* eslint-disable no-undef */
import {
  BOTTOM_GAP,
  TOP_GAP,
  POINTER_HEIGHT,
  ZERO_WIDTH_SPACE
} from './constants';
/*
function generateColorOptions() {
  const options = document.createElement('div');
  options.classList.add('highlight-menu-options');
  for (let i = 0; i < 4; i += 1) {
    const optionWrapper = document.createElement('div');
    optionWrapper.classList.add('highlight-option-wrapper');

    const option = document.createElement('div');
    option.classList.add('highlight-option');
    option.setAttribute('data-color', colors[i]);
    option.style.backgroundColor = colors[i];
    option.style.borderColor = chroma(colors[i])
      .darken(0.3)
      .hex();

    optionWrapper.append(option);
    options.append(optionWrapper);
  }

  return options;
}
*/

const colorHex = ['#F7A586', '#FAFD22', '#9BEBAA', '#9BC1EB'];
const colorNames = ['red', 'yellow', 'green', 'blue'];

function createOption(color) {
  const colorName = colorNames[colorHex.indexOf(color)];
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

  const optionList = shadow.querySelectorAll('.highlight-option');

  optionList.forEach(option => {
    option.addEventListener('click', () => {
      console.log('CLICKED ON OPTION');

      option.dispatchEvent(
        new CustomEvent('highlight', {
          bubbles: true,
          composed: true,
          detail: {
            color: option.dataset.color
          }
        })
      );
    });
  });

  document.body.append(menu);
}

function getInsertionMarker(ranges, isBackwards) {
  const range = isBackwards ? ranges[0] : ranges.slice(-1)[0];

  const tempMarker = document.createElement('span');

  tempMarker.innerHTML = ZERO_WIDTH_SPACE; // zero-width character

  const rangeCopy = range.cloneRange();
  rangeCopy.collapse(isBackwards); // if isBackwards is true, collapse(true) collapses to the start
  rangeCopy.insertNode(tempMarker);

  return tempMarker;
}

function calcMenuPosition(ranges, isBackwards, menu, range) {
  let positionAdjusted = false;

  /* First get the insertion marker placed at where it ought to be
      then do re-adjust later as necessary */
  let marker = getInsertionMarker(ranges, isBackwards);
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
    marker = getInsertionMarker(ranges, !isBackwards);
    markerCoords = marker.getBoundingClientRect();
    topOffset = markerCoords.bottom + TOP_GAP - POINTER_HEIGHT;

    positionAdjusted = true;
  } else if (windowRelativeTopOffset > maxTopOffset && !isBackwards) {
    marker.remove();
    range.normalize();
    marker = getInsertionMarker(ranges, !isBackwards);
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

function showMenu(ranges, isBackwards, range) {
  const menu = document.querySelector('.highlight-menu');
  const pointer = menu.shadowRoot.querySelector('.highlight-menu-pointer');

  menu.style.display = 'block';

  const { leftOffset, topOffset, positionAdjusted } = calcMenuPosition(
    ranges,
    isBackwards,
    menu,
    range
  );

  menu.style.left = `${leftOffset}px`;
  menu.style.top = `${topOffset}px`;

  if (positionAdjusted) {
    pointer.classList.add(!isBackwards ? 'pointer-bottom' : 'pointer-top');
    range.changeNormalizeElem();
  } else {
    pointer.classList.add(isBackwards ? 'pointer-bottom' : 'pointer-top');
  }

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
