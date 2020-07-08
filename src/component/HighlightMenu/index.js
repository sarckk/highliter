class HighlightMenu extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const { shadowRoot } = this;
    shadowRoot.innerHTML = `
      <link rel="stylesheet" href='dist/menu.build.css'/>
      <div class='menu-pointer'></div>
      <div>highlight</div>
    `;

    this.addEventListener('click', this._dispatchClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._dispatchClick);
  }

  _dispatchClick() {
    this.dispatchEvent(
      new CustomEvent('highlight', {
        bubbles: true,
        composed: true
      })
    );
  }

  hide() {
    this.style.display = 'none';
  }

  isVisible() {
    return this.style.display !== 'none';
  }

  show(range, isSelectionBackwards) {
    const rects = range.getClientRects();
    if (rects.length === 0) {
      console.error('nothing is selected');
      return;
    }

    this.style.display = 'flex';

    if (isSelectionBackwards) {
      this.style.left = `${rects[0].left - this.offsetWidth / 2}px`;
      this.style.top = `${rects[0].top - this.offsetHeight / 2 - 13}px`;
      this.shadowRoot
        .querySelector('.menu-pointer')
        .classList.remove('up-pointer');
      this.shadowRoot
        .querySelector('.menu-pointer')
        .classList.add('down-pointer');
    } else {
      this.style.left = `${rects[rects.length - 1].right -
        this.offsetWidth / 2}px`;
      this.style.top = `${rects[rects.length - 1].bottom + 5}px`;
      this.shadowRoot
        .querySelector('.menu-pointer')
        .classList.remove('down-pointer');
      this.shadowRoot
        .querySelector('.menu-pointer')
        .classList.add('up-pointer');
    }
  }

  /*
  _calcMenuPosition(selectionRange) {
    const { range, isBackwards } = selectionRange;

    let marker = addInsertionMarker(range, isBackwards);
    let markerCoords = marker.getBoundingClientRect();

    const maxTopOffset =
      document.documentElement.clientHeight - this.offsetHeight;

    const topOffsetBackwards =
      markerCoords.top - this.offsetHeight - BOTTOM_GAP;
    const topOffsetForwards = markerCoords.bottom + TOP_GAP;

    const windowRelativeTopOffset = isBackwards
      ? topOffsetBackwards
      : topOffsetForwards;

    let topOffset;

    if (
      (windowRelativeTopOffset < 0 && isBackwards) ||
      (windowRelativeTopOffset > maxTopOffset && !isBackwards)
    ) {
      marker.remove();
      marker = addInsertionMarker(range, !isBackwards);
      markerCoords = marker.getBoundingClientRect();

      if (isBackwards) {
        topOffset = markerCoords.bottom + TOP_GAP;
      } else {
        topOffset = markerCoords.top - this.offsetHeight - BOTTOM_GAP;
      }
    } else {
      // no change in position of menu, proceed as usual
      topOffset = windowRelativeTopOffset;
    }

    // adjust for absolute positioning
    topOffset += window.pageYOffset;

    // Set left offset so that menu is always in view
    let leftOffset = markerCoords.left - this.offsetWidth / 2;

    const maxLeftOffset =
      document.documentElement.clientWidth + this.offsetWidth;

    if (leftOffset < 0) {
      leftOffset = 0;
    }
    if (leftOffset > maxLeftOffset) {
      leftOffset = maxLeftOffset;
    }

    marker.remove(); // remove temp marker

    return { leftOffset, topOffset };
  }
  */
}

export function prepareMenu() {
  customElements.define('highlight-menu', HighlightMenu);
  const menu = document.createElement('highlight-menu');
  document.body.append(menu);
  menu.hide();
  return menu;
}
