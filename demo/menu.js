class HighlightMenu extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const { shadowRoot } = this;
    shadowRoot.innerHTML = `
      <style>
        :host {
          --bg-color: rgba(37, 37, 37, 0.9);
          position: absolute;
          z-index: 9999;
          border-radius: 4px;
          display: block;
          position: absolute;
          background-color: var(--bg-color);
          color: #f8f8f5;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        :host(:hover) {
          color: rgb(197, 197, 197);
        }
        
        .menu-pointer {
          position: absolute;
          left: 50%;
          border: solid transparent;
          height: 0;
          width: 0;
          pointer-events: none;
          border-width: 5px;
          margin-left: -5px;
        }
        
        .down-pointer {
          border-top-color: var(--bg-color);
          top: 100%;
        }
        
        .up-pointer {
          border-bottom-color: var(--bg-color);
          bottom: 100%;
        }
      </style>
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

  isVisible() {
    return this.style.display !== 'none';
  }

  hide() {
    if (this.isVisible()) {
      this.style.display = 'none';
    }
  }

  show({ range, isSelectionBackwards }) {
    const rects = range.getClientRects();
    if (rects.length === 0) {
      console.error('nothing is selected');
      return;
    }

    this.style.display = 'flex';

    if (isSelectionBackwards) {
      this.style.left = `${rects[0].left -
        this.offsetWidth / 2 +
        window.pageXOffset}px`;
      this.style.top = `${rects[0].top -
        this.offsetHeight / 2 -
        19 +
        window.pageYOffset}px`;
      this.shadowRoot
        .querySelector('.menu-pointer')
        .classList.remove('up-pointer');
      this.shadowRoot
        .querySelector('.menu-pointer')
        .classList.add('down-pointer');
    } else {
      this.style.left = `${rects[rects.length - 1].right -
        this.offsetWidth / 2 +
        window.pageXOffset}px`;
      this.style.top = `${rects[rects.length - 1].bottom +
        11 +
        window.pageYOffset}px`;
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
