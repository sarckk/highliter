// browser events to listen to

// credit: see Tigger's answer at https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
const touchDevice =
  navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;

export const Moves = {
  MOUSE_UP: touchDevice ? 'touchend' : 'mouseup',
  MOUSE_DOWN: touchDevice ? 'touchstart' : 'mousedown',
  HOVER: touchDevice ? 'touchstart' : 'mouseover',
  CLICK: touchDevice ? 'touchstart' : 'click',
  HIGHLIGHT: 'highlight' // custom Event dispatched by highlighter menu
};
