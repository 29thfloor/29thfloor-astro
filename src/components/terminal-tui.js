/**
 * <terminal-tui> Web Component
 * Main orchestrator for the terminal user interface.
 * Coordinates prompt, menu, and output components.
 *
 * @attr {string} page-title - Title shown when page loads (e.g., "HOME", "BLOG")
 *
 * Commands:
 * - menu: Show navigation menu
 * - help: Show available commands
 * - clear: Clear scrollback history
 * - home, blog, projects, work, about, contact, archive: Direct navigation
 */
class TerminalTUI extends HTMLElement {
  static get observedAttributes() {
    return ['page-title'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._menuVisible = false;
    this._initialized = false;
  }

  connectedCallback() {
    this.render();
    this.setupComponents();
    this.setupEventListeners();
    this.showInitialContent();
    this._initialized = true;
  }

  disconnectedCallback() {
    this.cleanup();
  }

  // --- Configuration ---

  get pageTitle() {
    return this.getAttribute('page-title') || 'TERMINAL';
  }

  get navigationItems() {
    return [
      { label: 'Home', path: '/' },
      { label: 'Blog', path: '/blog' },
      { label: 'Projects', path: '/projects' },
      { label: 'Work', path: '/work' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Archive', path: '/archive' }
    ];
  }

  get commands() {
    return {
      menu: () => this.showMenu(),
      help: () => this.showHelp(),
      clear: () => this.clearOutput(),
      // Direct navigation
      home: () => this.navigate('/'),
      blog: () => this.navigate('/blog'),
      projects: () => this.navigate('/projects'),
      work: () => this.navigate('/work'),
      about: () => this.navigate('/about'),
      contact: () => this.navigate('/contact'),
      archive: () => this.navigate('/archive')
    };
  }

  // --- Public API ---

  /**
   * Execute a command by name
   * @param {string} command - Command to execute
   */
  executeCommand(command) {
    const cmd = command.toLowerCase().trim();
    const handler = this.commands[cmd];

    if (handler) {
      handler();
    } else {
      this.showError(`Unknown command: ${command}`);
      this.appendOutput('Type "help" for available commands.', 'system');
    }
  }

  /**
   * Append content to the output area
   * @param {string} content - Content to append
   * @param {string} type - Entry type (system, command, error, success)
   */
  appendOutput(content, type = null) {
    const output = this.shadowRoot.querySelector('terminal-output');
    if (output) {
      output.appendLine(content, type);
    }
  }

  /**
   * Show the navigation menu
   */
  showMenu() {
    if (this._menuVisible) return;

    this._menuVisible = true;
    const menu = this.shadowRoot.querySelector('terminal-menu');
    const prompt = this.shadowRoot.querySelector('terminal-prompt');

    if (menu) {
      menu.style.display = 'block';
      menu.focus();
    }
    if (prompt) {
      prompt.style.display = 'none';
    }
  }

  /**
   * Hide the navigation menu
   */
  hideMenu() {
    this._menuVisible = false;
    const menu = this.shadowRoot.querySelector('terminal-menu');
    const prompt = this.shadowRoot.querySelector('terminal-prompt');

    if (menu) {
      menu.style.display = 'none';
    }
    if (prompt) {
      prompt.style.display = 'block';
      prompt.focus();
    }
  }

  /**
   * Navigate to a path
   * @param {string} path - Path to navigate to
   */
  navigate(path) {
    // Save session state before navigating
    this.saveSession();

    // Navigate
    window.location.href = path;
  }

  // --- Private Methods ---

  setupComponents() {
    // Get references to child components
    this._output = this.shadowRoot.querySelector('terminal-output');
    this._menu = this.shadowRoot.querySelector('terminal-menu');
    this._prompt = this.shadowRoot.querySelector('terminal-prompt');
  }

  setupEventListeners() {
    // Handle prompt submissions
    this._promptHandler = (e) => {
      const { command } = e.detail;
      // Echo the command to output
      this.appendOutput(command, 'command');
      // Execute it
      this.executeCommand(command);
    };
    this.shadowRoot.addEventListener('prompt:submit', this._promptHandler);

    // Handle menu confirmations
    this._menuConfirmHandler = (e) => {
      const { item } = e.detail;
      this.hideMenu();
      this.appendOutput(`Navigating to ${item.label}...`, 'system');
      this.navigate(item.path);
    };
    this.shadowRoot.addEventListener('menu:confirm', this._menuConfirmHandler);

    // Handle Escape key to close menu
    this._escapeHandler = (e) => {
      if (e.key === 'Escape' && this._menuVisible) {
        e.preventDefault();
        this.hideMenu();
        this.appendOutput('Menu cancelled.', 'system');
      }
    };
    this.addEventListener('keydown', this._escapeHandler);
  }

  cleanup() {
    if (this._promptHandler) {
      this.shadowRoot.removeEventListener('prompt:submit', this._promptHandler);
    }
    if (this._menuConfirmHandler) {
      this.shadowRoot.removeEventListener('menu:confirm', this._menuConfirmHandler);
    }
    if (this._escapeHandler) {
      this.removeEventListener('keydown', this._escapeHandler);
    }
  }

  showInitialContent() {
    const isFirstVisit = !sessionStorage.getItem('tui-visited');
    const savedHistory = this.loadSession();

    if (savedHistory && savedHistory.length > 0) {
      // Restore previous session
      savedHistory.forEach(entry => {
        this.appendOutput(entry.content, entry.type);
      });
      this.appendOutput(`Connected to ${this.pageTitle}`, 'system');
    } else if (isFirstVisit) {
      // Show welcome message
      this.showWelcome();
      sessionStorage.setItem('tui-visited', 'true');
    } else {
      // Just show connection message
      this.appendOutput(`Connected to ${this.pageTitle}`, 'system');
    }
  }

  showWelcome() {
    this.appendOutput('Welcome to 29thfloor.com', 'system');
    this.appendOutput('Type "menu" to navigate or "help" for commands.', 'system');
    this.appendOutput('', 'system');
    this.appendOutput(`Connected to ${this.pageTitle}`, 'system');
  }

  showHelp() {
    this.appendOutput('Available commands:', 'system');
    this.appendOutput('  menu     - Show navigation menu', 'system');
    this.appendOutput('  help     - Show this help message', 'system');
    this.appendOutput('  clear    - Clear screen', 'system');
    this.appendOutput('', 'system');
    this.appendOutput('Direct navigation:', 'system');
    this.appendOutput('  home, blog, projects, work, about, contact, archive', 'system');
  }

  showError(message) {
    this.appendOutput(message, 'error');
  }

  clearOutput() {
    const output = this.shadowRoot.querySelector('terminal-output');
    if (output) {
      output.clear();
    }
    // Clear saved session
    sessionStorage.removeItem('tui-history');
  }

  saveSession() {
    // Save recent history for restoration after navigation
    // We'll implement this more fully when integrating with layouts
    const output = this.shadowRoot.querySelector('terminal-output');
    if (output) {
      // For now, just mark that we have a session
      sessionStorage.setItem('tui-session', 'active');
    }
  }

  loadSession() {
    // Load previous session history
    // Returns null for now - will implement with layout integration
    return null;
  }

  render() {
    const menuItems = JSON.stringify(this.navigationItems);

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="tui-container">
        <terminal-output class="tui-output">
          <slot></slot>
        </terminal-output>
        <div class="tui-input-area">
          <terminal-menu
            style="display: none;"
            prompt="Where to next?"
            items='${menuItems}'
          ></terminal-menu>
          <terminal-prompt
            prompt-char=">"
            placeholder="type a command..."
          ></terminal-prompt>
        </div>
      </div>
    `;
  }

  getStyles() {
    return `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        font-family: 'Fira Code', monospace;
      }

      .tui-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }

      .tui-output {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .tui-input-area {
        flex-shrink: 0;
        border-top: 1px solid #0C3A38;
        padding: 0.5rem 1rem;
      }

      /* Fade transitions for menu/prompt toggle */
      terminal-menu,
      terminal-prompt {
        transition: opacity 0.15s ease-out;
      }

      terminal-menu[style*="display: none"],
      terminal-prompt[style*="display: none"] {
        opacity: 0;
      }

      /* Ensure child components are loaded */
      terminal-output:not(:defined),
      terminal-menu:not(:defined),
      terminal-prompt:not(:defined) {
        display: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        terminal-menu,
        terminal-prompt {
          transition: none;
        }
      }
    `;
  }
}

customElements.define('terminal-tui', TerminalTUI);
