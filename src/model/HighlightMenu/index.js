import { getEndParentLineHeight } from './dom';
import { prepareMenu } from '../../util/dom';
import Highlighter from '../Highlighter';
import {
  BOTTOM_GAP,
  TOP_GAP,
  POINTER_HEIGHT,
  ZERO_WIDTH_SPACE
} from './constants';

export default class HighlightMenu {
  constructor(range) {
    this._selectedRanges = range.getAllSelectedRanges();
    this._selectionIsBackwards = range.isBackwards;

    return this.render();
  }

  render() {
    const { highlightMenu, pointer } = prepareMenu();

    document.body.append(highlightMenu);

    highlightMenu.onclick = e => {
      const { color } = e.target.dataset;
      Highlighter.highlightFromSelection(this._selectedRanges, color);
    };

    const { leftOffset, topOffset, positionAdjusted } = this.setMenuPosition(
      highlightMenu
    );

    highlightMenu.style.left = `${leftOffset}px`;
    highlightMenu.style.top = `${topOffset}px`;

    if (positionAdjusted) {
      pointer.classList.add(
        !this._selectionIsBackwards ? 'pointer-bottom' : 'pointer-top'
      );
    } else {
      pointer.classList.add(
        this._selectionIsBackwards ? 'pointer-bottom' : 'pointer-top'
      );
    }

    return highlightMenu;
  }

  getInsertionMarker(selectionIsBackwards) {
    const range = selectionIsBackwards
      ? this._selectedRanges[0]
      : this._selectedRanges.slice(-1)[0];

    const tempMarker = document.createElement('span');

    tempMarker.innerHTML = ZERO_WIDTH_SPACE; // zero-width character

    const rangeCopy = range.cloneRange();
    rangeCopy.collapse(selectionIsBackwards); // if isBackwards is true, collapse(true) collapses to the start
    rangeCopy.insertNode(tempMarker);

    return tempMarker;
  }

  setMenuPosition(highlightMenu) {
    let positionAdjusted = false;

    /* First get the insertion marker placed at where it ought to be
      then do re-adjust later as necessary */
    let marker = this.getInsertionMarker(this._selectionIsBackwards);
    let markerCoords = marker.getBoundingClientRect();

    // Set vertical offset so that menu is always in view
    const vertOffset = getEndParentLineHeight(this._selectedRanges);
    const windowHeight = document.documentElement.clientHeight;

    const windowRelativeTopOffset =
      markerCoords.top +
      (this._selectionIsBackwards
        ? -highlightMenu.offsetHeight - BOTTOM_GAP
        : vertOffset + (TOP_GAP - POINTER_HEIGHT));

    let topOffset;

    const btmMenuAdjustment = vertOffset + TOP_GAP + window.pageYOffset;
    const tpMenuAdjustment =
      -highlightMenu.offsetHeight - BOTTOM_GAP + window.pageYOffset;

    if (windowRelativeTopOffset < 0 && this._selectionIsBackwards === true) {
      marker = this.getInsertionMarker(!this._selectionIsBackwards);
      markerCoords = marker.getBoundingClientRect();
      topOffset = markerCoords.top + btmMenuAdjustment;

      positionAdjusted = true;
    } else if (
      windowRelativeTopOffset > windowHeight &&
      this._selectionIsBackwards === false
    ) {
      marker = this.getInsertionMarker(!this._selectionIsBackwards);
      markerCoords = marker.getBoundingClientRect();

      topOffset = markerCoords.top + tpMenuAdjustment;

      positionAdjusted = true;
    } else {
      // no change in position of menu, proceed as usual
      topOffset =
        markerCoords.top +
        (this._selectionIsBackwards ? tpMenuAdjustment : btmMenuAdjustment);
    }

    // Set left offset so that menu is always in view
    let leftOffset =
      markerCoords.left - highlightMenu.offsetWidth / 2 + window.pageXOffset;

    const maxLeftOffset =
      document.documentElement.clientWidth +
      window.pageXOffset -
      highlightMenu.offsetWidth;

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
}
