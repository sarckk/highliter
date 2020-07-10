import { Moves } from '../../util/moves';

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
      new CustomEvent(Moves.HIGHLIGHT, {
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

  show({ range, isSelectionBackwards }) {
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
}

export function prepareMenu() {
  customElements.define('highlight-menu', HighlightMenu);
  const menu = document.createElement('highlight-menu');
  document.body.append(menu);
  menu.hide();
  return menu;
}
