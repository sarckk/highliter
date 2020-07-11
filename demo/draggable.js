function makePanelDraggable() {
  const touchDevice =
    navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;
  const panel = document.querySelector('.color-panel');
  const clientH = touchDevice
    ? window.outerHeight
    : document.documentElement.clientHeight;
  const clientW = document.documentElement.clientWidth;

  let isDragging = false;
  let shiftX;
  let shiftY;

  function moveAt(clientX, clientY) {
    let newX = clientX - shiftX;
    let newY = clientY - shiftY;

    if (newX < 0) newX = 0;
    if (newX > clientW - panel.offsetWidth) {
      newX = clientW - panel.offsetWidth;
    }

    if (newY < 0) newY = 0;
    if (newY > clientH - panel.offsetHeight) {
      newY = clientH - panel.offsetHeight;
    }

    if (touchDevice) {
      panel.style.right = `${clientW - newX - panel.offsetWidth}px`;
      panel.style.bottom = `${clientH - newY - panel.offsetHeight}px`;
    } else {
      panel.style.left = `${newX}px`;
      panel.style.top = `${newY}px`;
    }
  }

  function dragStart(e) {
    const target = e.target.closest('.color-panel');
    if (!target) {
      return;
    }

    isDragging = true;

    const rect = target.getBoundingClientRect();
    if (e.type === 'touchstart') {
      shiftX = e.touches[0].clientX - rect.left;
      shiftY = e.touches[0].clientY - rect.top;
    } else {
      shiftX = e.clientX - rect.left;
      shiftY = e.clientY - rect.top;
    }

    target.style.position = 'fixed';
    moveAt(e.clientX, e.clientY);
  }

  function drag(e) {
    if (!isDragging) {
      return;
    }

    e.preventDefault();
    if (e.type === 'touchmove') {
      moveAt(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      moveAt(e.clientX, e.clientY);
    }
  }

  function dragEnd() {
    if (!isDragging) {
      return;
    }

    isDragging = false;
  }

  document.addEventListener('touchstart', dragStart);
  document.addEventListener('touchend', dragEnd);
  document.addEventListener('touchmove', drag, { passive: false });

  document.addEventListener('mousedown', dragStart);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('mousemove', drag, { passive: false });
}

export { makePanelDraggable };
