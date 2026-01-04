/**
 * <terminal-frame> Web Component
 * A cyberpunk terminal frame container with header, content slot, and status footer.
 */
class TerminalFrame extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'status', 'no-scanlines'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  get title() {
    return this.getAttribute('title') || '29F_ TERMINAL v2.0';
  }

  get status() {
    return this.getAttribute('status') || 'ONLINE';
  }

  get noScanlines() {
    return this.hasAttribute('no-scanlines');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      <div class="terminal-frame">
        <header class="terminal-header">
          <span class="terminal-title">${this.title}</span>
          <span class="terminal-indicators">◀ ▪ ▪ ▪ ▶</span>
        </header>
        <div class="terminal-content">
          <slot></slot>
        </div>
        <footer class="terminal-footer">
          <span class="terminal-status">STATUS: ${this.status}</span>
        </footer>
      </div>
    `;
  }

  getStyles() {
    const showScanlines = !this.noScanlines;

    return `
      :host {
        --term-bg: #011518;
        --term-text: #26A69A;
        --term-accent: #FFD600;
        --term-dim: #0C3A38;
        --term-highlight: #1D7A74;

        display: block;
        font-family: 'Fira Code', monospace;
        color: var(--term-text);
        background: var(--term-bg);
      }

      .terminal-frame {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
      }

      /* Scanlines overlay */
      ${showScanlines ? `
      .terminal-frame::after {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.15) 2px,
          rgba(0, 0, 0, 0.15) 4px
        );
        pointer-events: none;
        z-index: 10;
      }
      ` : ''}

      /* ASCII border characters */
      .terminal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--term-dim);
        position: relative;
      }

      .terminal-header::before {
        content: '╔';
        position: absolute;
        top: -1px;
        left: -1px;
      }

      .terminal-header::after {
        content: '╗';
        position: absolute;
        top: -1px;
        right: -1px;
      }

      .terminal-title {
        font-weight: bold;
        text-shadow: 0 0 10px var(--term-text), 0 0 20px var(--term-text);
        animation: glow-pulse 3s ease-in-out infinite;
      }

      @keyframes glow-pulse {
        0%, 100% {
          text-shadow: 0 0 10px var(--term-text), 0 0 20px var(--term-text);
        }
        50% {
          text-shadow: 0 0 15px var(--term-text), 0 0 30px var(--term-text), 0 0 40px var(--term-text);
        }
      }

      .terminal-indicators {
        letter-spacing: 0.25em;
        color: var(--term-dim);
      }

      .terminal-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-left: 1px solid var(--term-dim);
        border-right: 1px solid var(--term-dim);
        position: relative;
      }

      .terminal-content::before {
        content: '║';
        position: absolute;
        top: 0;
        left: -1px;
      }

      .terminal-content::after {
        content: '║';
        position: absolute;
        top: 0;
        right: -1px;
      }

      .terminal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        border-top: 1px solid var(--term-dim);
        position: relative;
      }

      .terminal-footer::before {
        content: '╚';
        position: absolute;
        bottom: -1px;
        left: -1px;
      }

      .terminal-footer::after {
        content: '╝';
        position: absolute;
        bottom: -1px;
        right: -1px;
      }

      .terminal-status {
        font-size: 0.875rem;
        color: var(--term-dim);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Slotted content fills available space */
      ::slotted(*) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      /* Border glow on hover */
      .terminal-frame:hover .terminal-header,
      .terminal-frame:hover .terminal-footer {
        border-color: var(--term-highlight);
      }

      .terminal-frame:hover .terminal-content {
        border-color: var(--term-highlight);
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .terminal-title {
          animation: none;
        }
      }
    `;
  }
}

customElements.define('terminal-frame', TerminalFrame);
