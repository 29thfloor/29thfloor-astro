/**
 * <terminal-menu> Web Component
 * A keyboard and mouse navigable menu for terminal UI.
 *
 * @attr {string} items - JSON array of menu items: [{label, value, path}]
 * @attr {number} selected - Currently selected index (default: 0)
 * @attr {string} prompt - Optional prompt text above menu
 *
 * @fires menu:select - When selection changes, with { index, item } detail
 * @fires menu:confirm - When item is confirmed, with { index, item } detail
 */
class TerminalMenu extends HTMLElement {
  static get observedAttributes() {
    return ['items', 'selected', 'prompt'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
    this._selectedIndex = 0;
  }

  connectedCallback() {
    this.parseItems();
    this.render();
    this.setupKeyboardListener();
    this.setupClickListener();

    // Make component focusable
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'items') {
        this.parseItems();
      } else if (name === 'selected') {
        this._selectedIndex = parseInt(newValue, 10) || 0;
      }
      if (this.shadowRoot.innerHTML) {
        this.render();
      }
    }
  }

  // --- Public API ---

  get items() {
    return this._items;
  }

  set items(val) {
    this._items = Array.isArray(val) ? val : [];
    this.render();
  }

  get selected() {
    return this._selectedIndex;
  }

  set selected(val) {
    const index = parseInt(val, 10) || 0;
    if (index >= 0 && index < this._items.length && index !== this._selectedIndex) {
      this._selectedIndex = index;
      this.updateSelection();
      this.dispatchEvent(new CustomEvent('menu:select', {
        bubbles: true,
        detail: { index: this._selectedIndex, item: this._items[this._selectedIndex] }
      }));
    }
  }

  get prompt() {
    return this.getAttribute('prompt') || '';
  }

  selectNext() {
    if (this._selectedIndex < this._items.length - 1) {
      this.selected = this._selectedIndex + 1;
    }
  }

  selectPrev() {
    if (this._selectedIndex > 0) {
      this.selected = this._selectedIndex - 1;
    }
  }

  confirm() {
    if (this._items.length > 0) {
      this.dispatchEvent(new CustomEvent('menu:confirm', {
        bubbles: true,
        detail: { index: this._selectedIndex, item: this._items[this._selectedIndex] }
      }));
    }
  }

  // --- Private Methods ---

  parseItems() {
    const itemsAttr = this.getAttribute('items');
    if (itemsAttr) {
      try {
        this._items = JSON.parse(itemsAttr);
      } catch (e) {
        console.error('terminal-menu: Invalid items JSON', e);
        this._items = [];
      }
    }

    // Clamp selected index
    const selectedAttr = this.getAttribute('selected');
    this._selectedIndex = Math.min(
      Math.max(0, parseInt(selectedAttr, 10) || 0),
      Math.max(0, this._items.length - 1)
    );
  }

  setupKeyboardListener() {
    this._keyHandler = (e) => this.handleKeydown(e);
    this.addEventListener('keydown', this._keyHandler);
  }

  setupClickListener() {
    // Use event delegation - attach once to shadowRoot
    this._clickHandler = (e) => {
      const item = e.target.closest('.menu-item');
      if (item) {
        const index = parseInt(item.dataset.index, 10);
        this.selected = index;
        this.confirm();
      }
    };

    this._hoverHandler = (e) => {
      const item = e.target.closest('.menu-item');
      if (item) {
        const index = parseInt(item.dataset.index, 10);
        this.selected = index;
      }
    };

    this.shadowRoot.addEventListener('click', this._clickHandler);
    this.shadowRoot.addEventListener('mouseover', this._hoverHandler);
  }

  removeEventListeners() {
    if (this._keyHandler) {
      this.removeEventListener('keydown', this._keyHandler);
    }
    if (this._clickHandler) {
      this.shadowRoot.removeEventListener('click', this._clickHandler);
    }
    if (this._hoverHandler) {
      this.shadowRoot.removeEventListener('mouseover', this._hoverHandler);
    }
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowUp':
      case 'k': // vim-style
        e.preventDefault();
        this.selectPrev();
        break;

      case 'ArrowDown':
      case 'j': // vim-style
        e.preventDefault();
        this.selectNext();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        this.confirm();
        break;

      case 'Home':
        e.preventDefault();
        this.selected = 0;
        break;

      case 'End':
        e.preventDefault();
        this.selected = this._items.length - 1;
        break;
    }
  }

  updateSelection() {
    const items = this.shadowRoot.querySelectorAll('.menu-item');
    items.forEach((item, index) => {
      const isSelected = index === this._selectedIndex;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-selected', isSelected);

      // Update the > indicator
      const indicator = item.querySelector('.menu-indicator');
      if (indicator) {
        indicator.textContent = isSelected ? '>' : ' ';
      }
    });
  }

  render() {
    const promptText = this.prompt;

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="menu-container" role="listbox" aria-label="Navigation menu">
        ${promptText ? `<div class="menu-prompt">${promptText}</div>` : ''}
        <ul class="menu-list">
          ${this._items.map((item, index) => this.renderItem(item, index)).join('')}
        </ul>
      </div>
    `;
  }

  renderItem(item, index) {
    const isSelected = index === this._selectedIndex;
    const label = item.label || item;
    const value = item.value || item.path || label;

    return `
      <li
        class="menu-item ${isSelected ? 'selected' : ''}"
        role="option"
        aria-selected="${isSelected}"
        data-index="${index}"
        data-value="${value}"
      >
        <span class="menu-indicator" aria-hidden="true">${isSelected ? '>' : ' '}</span>
        <span class="menu-label">${label}</span>
      </li>
    `;
  }

  getStyles() {
    return `
      :host {
        --term-text: #26A69A;
        --term-accent: #FFD600;
        --term-dim: #0C3A38;
        --term-highlight: #1D7A74;

        display: block;
        font-family: 'Fira Code', monospace;
        font-size: 1rem;
        color: var(--term-text);
        outline: none;
      }

      .menu-container {
        padding: 0.5rem 0;
      }

      .menu-prompt {
        margin-bottom: 1rem;
        color: var(--term-text);
        text-shadow: 0 0 5px var(--term-text);
      }

      .menu-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .menu-item {
        display: flex;
        align-items: center;
        min-height: 44px; /* Touch-friendly */
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: background-color 0.1s ease;
        touch-action: manipulation; /* Prevent double-tap zoom */
        user-select: none;
      }

      .menu-item:hover {
        background: rgba(38, 166, 154, 0.1);
      }

      .menu-item.selected {
        color: var(--term-accent);
        text-shadow: 0 0 10px var(--term-accent);
      }

      .menu-item.selected .menu-indicator {
        color: var(--term-accent);
        text-shadow: 0 0 10px var(--term-accent);
      }

      .menu-indicator {
        width: 1.5em;
        font-weight: bold;
        flex-shrink: 0;
      }

      .menu-label {
        flex: 1;
      }

      /* Outline on hover only */
      .menu-item:hover {
        outline: 1px solid var(--term-accent);
        outline-offset: -1px;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .menu-item {
          transition: none;
        }
      }
    `;
  }
}

customElements.define('terminal-menu', TerminalMenu);
