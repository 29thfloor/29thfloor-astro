/**
 * <terminal-prompt> Web Component
 * A command input line with blinking cursor for terminal UI.
 *
 * @fires prompt:submit - When Enter is pressed, with { command } detail
 * @fires prompt:change - When input changes, with { value } detail
 */
class TerminalPrompt extends HTMLElement {
  static get observedAttributes() {
    return ['prompt-char', 'placeholder', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._historyIndex = -1;
    this._commandHistory = [];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();

    // Auto-focus if not disabled
    if (!this.disabled) {
      requestAnimationFrame(() => this.focus());
    }
  }

  disconnectedCallback() {
    // Clean up any listeners if needed
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.shadowRoot.innerHTML) {
      this.render();
      this.setupEventListeners();
    }
  }

  // --- Public API ---

  get promptChar() {
    return this.getAttribute('prompt-char') || '>';
  }

  get placeholder() {
    return this.getAttribute('placeholder') || '';
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  get value() {
    const input = this.shadowRoot.querySelector('.prompt-input');
    return input ? input.value : '';
  }

  set value(val) {
    const input = this.shadowRoot.querySelector('.prompt-input');
    if (input) {
      input.value = val;
    }
  }

  focus() {
    const input = this.shadowRoot.querySelector('.prompt-input');
    if (input) {
      input.focus();
    }
  }

  clear() {
    this.value = '';
    this._historyIndex = -1;
  }

  // --- Private Methods ---

  setupEventListeners() {
    const input = this.shadowRoot.querySelector('.prompt-input');
    if (!input) return;

    input.addEventListener('keydown', (e) => this.handleKeydown(e));
    input.addEventListener('input', (e) => this.handleInput(e));

    // Click anywhere on component focuses input
    this.shadowRoot.addEventListener('click', () => this.focus());
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.submit();
        break;

      case 'Escape':
        e.preventDefault();
        this.clear();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory(-1);
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory(1);
        break;
    }
  }

  handleInput(e) {
    this.dispatchEvent(new CustomEvent('prompt:change', {
      bubbles: true,
      detail: { value: e.target.value }
    }));
  }

  submit() {
    const command = this.value.trim();

    if (command) {
      // Add to history
      this._commandHistory.push(command);
      this._historyIndex = this._commandHistory.length;

      // Dispatch event
      this.dispatchEvent(new CustomEvent('prompt:submit', {
        bubbles: true,
        detail: { command }
      }));
    }

    this.clear();
  }

  navigateHistory(direction) {
    if (this._commandHistory.length === 0) return;

    const newIndex = this._historyIndex + direction;

    if (newIndex >= 0 && newIndex < this._commandHistory.length) {
      this._historyIndex = newIndex;
      this.value = this._commandHistory[this._historyIndex];
    } else if (newIndex >= this._commandHistory.length) {
      this._historyIndex = this._commandHistory.length;
      this.value = '';
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="prompt-container">
        <span class="prompt-char">${this.promptChar}</span>
        <div class="input-wrapper">
          <input
            type="text"
            class="prompt-input"
            placeholder="${this.placeholder}"
            ${this.disabled ? 'disabled' : ''}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            aria-label="Terminal command input"
          />
          <span class="cursor" aria-hidden="true"></span>
        </div>
      </div>
    `;
  }

  getStyles() {
    return `
      :host {
        --term-text: #26A69A;
        --term-accent: #FFD600;
        --term-dim: #0C3A38;

        display: block;
        font-family: 'Fira Code', monospace;
        font-size: 1rem;
        color: var(--term-text);
      }

      .prompt-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0;
      }

      .prompt-char {
        color: var(--term-accent);
        font-weight: bold;
        text-shadow: 0 0 10px var(--term-accent);
        user-select: none;
      }

      .input-wrapper {
        flex: 1;
        position: relative;
      }

      .prompt-input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: inherit;
        font: inherit;
        caret-color: var(--term-text);
        padding: 0;
      }

      .prompt-input::placeholder {
        color: var(--term-dim);
      }

      .prompt-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Custom blinking cursor - only shown when input is empty and focused */
      .cursor {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0.6em;
        height: 1.2em;
        background: var(--term-text);
        animation: blink 1s step-end infinite;
        pointer-events: none;
      }

      /* Hide custom cursor when input has content (native caret takes over) */
      .prompt-input:not(:placeholder-shown) ~ .cursor {
        display: none;
      }

      /* Dim cursor when not focused */
      .prompt-input:not(:focus) ~ .cursor {
        opacity: 0.3;
        animation: none;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .cursor {
          animation: none;
          opacity: 1;
        }
      }
    `;
  }
}

customElements.define('terminal-prompt', TerminalPrompt);
