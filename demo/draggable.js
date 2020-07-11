function makePanelDraggable() {
  const panel = document.querySelector('.color-panel');

  let isDragging = false;
  let shiftX;
  let shiftY;

  function moveAt(clientX, clientY) {
    let newX = clientX - shiftX;
    let newY = clientY - shiftY;

    if (newX < 0) newX = 0;
    if (newX > document.documentElement.clientWidth - panel.offsetWidth) {
      newX = document.documentElement.clientWidth - panel.offsetWidth;
    }

    if (newY < 0) newY = 0;
    if (newY > document.documentElement.clientHeight - panel.offsetHeight) {
      newY = document.documentElement.clientHeight - panel.offsetHeight;
    }

    panel.style.left = `${newX}px`;
    panel.style.top = `${newY}px`;
  }

  function dragStart(e) {
    const { target } = e;
    if (!target.classList.contains('color-panel')) {
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

    if (e.type === 'touchstart') {
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
  document.addEventListener('touchmove', drag);

  document.addEventListener('mousedown', dragStart);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('mousemove', drag);
}

export { makePanelDraggable };
