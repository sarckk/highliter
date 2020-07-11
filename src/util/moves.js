// browser events to listen to

// credit: see Tigger's answer at https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
export const touchDevice =
  navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;

export const Moves = {
  MOUSE_UP: touchDevice ? 'contextmenu' : 'mouseup',
  MOUSE_DOWN: 'mousedown', // only on non-touch devices
  HOVER: touchDevice ? 'touchstart' : 'mouseover',
  CLICK: touchDevice ? 'touchstart' : 'click',
  HIGHLIGHT: 'highlight',
  SELECTION_CHANGE: 'selectionchange' // only on touch devices
};
