// gets absolute position (left,top) of the element
function getRealPos(el) {
  let _el = el;
  let left = 0;
  let top = 0;
  do {
    left += _el.offsetLeft;
    top += _el.offsetTop;
    _el = _el.offsetParent;
  } while (_el);

  return { left, top };
}

export { getRealPos };
