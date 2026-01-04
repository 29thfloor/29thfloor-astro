/**
 * <terminal-output> Web Component
 * A scrollable container for terminal output history.
 *
 * @method append(content) - Adds content (string or HTMLElement) to the output
 * @method appendLine(text) - Adds a text line to the output
 * @method clear() - Clears all output
 * @method scrollToBottom() - Scrolls to the bottom of the output
 */
class TerminalOutput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  // --- Public API ---

  /**
   * Append content to the output.
   * @param {string|HTMLElement} content - HTML string or element to append
   * @param {object} options - Optional settings
   * @param {string} options.type - Entry type for styling (e.g., 'system', 'command', 'error')
   */
  append(content, options = {}) {
    const container = this.shadowRoot.querySelector('.output-container');
    if (!container) return;

    const entry = document.createElement('div');
    entry.className = 'output-entry';

    if (options.type) {
      entry.classList.add(`entry-${options.type}`);
    }

    if (typeof content === 'string') {
      entry.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      entry.appendChild(content.cloneNode(true));
    }

    container.appendChild(entry);
    this.scrollToBottom();

    return entry;
  }

  /**
   * Append a simple text line.
   * @param {string} text - Text to append
   * @param {string} type - Optional entry type
   */
  appendLine(text, type = null) {
    const escaped = this.escapeHtml(text);
    return this.append(escaped, type ? { type } : {});
  }

  /**
   * Clear all output content.
   */
  clear() {
    const container = this.shadowRoot.querySelector('.output-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  /**
   * Scroll to the bottom of the output.
   */
  scrollToBottom() {
    const container = this.shadowRoot.querySelector('.output-container');
    if (container) {
      // Use requestAnimationFrame to ensure content is rendered
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }

  // --- Private Methods ---

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="output-container" role="log" aria-live="polite" aria-label="Terminal output">
        <slot></slot>
      </div>
    `;
  }

  getStyles() {
    return `
      :host {
        --term-text: #26A69A;
        --term-accent: #FFD600;
        --term-dim: #0C3A38;
        --term-error: #FF5252;
        --term-success: #69F0AE;

        display: block;
        font-family: 'Fira Code', monospace;
        font-size: 1rem;
        color: var(--term-text);
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .output-container {
        height: 100%;
        overflow-y: auto;
        padding: 0.5rem 1rem;
        scroll-behavior: smooth;
      }

      /* Scrollbar styling */
      .output-container::-webkit-scrollbar {
        width: 8px;
      }

      .output-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .output-container::-webkit-scrollbar-thumb {
        background: var(--term-dim);
        border-radius: 4px;
      }

      .output-container::-webkit-scrollbar-thumb:hover {
        background: var(--term-text);
      }

      /* Slotted content (initial page content) */
      ::slotted(*) {
        margin-bottom: 1rem;
      }

      /* Appended entries */
      .output-entry {
        margin-bottom: 0.5rem;
        animation: fadeIn 0.15s ease-out;
      }

      .output-entry:last-child {
        margin-bottom: 0;
      }

      /* Entry types */
      .entry-system {
        color: var(--term-dim);
      }

      .entry-command {
        color: var(--term-accent);
      }

      .entry-command::before {
        content: '> ';
      }

      .entry-error {
        color: var(--term-error);
      }

      .entry-success {
        color: var(--term-success);
      }

      /* Animation */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .output-container {
          scroll-behavior: auto;
        }

        .output-entry {
          animation: none;
        }
      }
    `;
  }
}

customElements.define('terminal-output', TerminalOutput);
