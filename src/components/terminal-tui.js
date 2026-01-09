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
 * - home, blog, projects, work, everyday, about, contact, archive: Direct navigation
 *
 * Keyboard Shortcuts:
 * - H: Home, B: Blog, W: Work, E: Everyday, A: About, C: Contact
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
    this._consoleHidden = false;
    this._consoleHeight = 120;
    this._isResizing = false;
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
      archive: () => this.navigate('/archive'),
      everyday: () => this.navigate('/everyday')
    };
  }

  /**
   * Single-letter keyboard shortcuts for quick navigation
   */
  get shortcuts() {
    return {
      'h': '/',
      'b': '/blog',
      'w': '/work',
      'e': '/everyday',
      'a': '/about',
      'c': '/contact'
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
    this._consoleTray = this.shadowRoot.getElementById('console-tray');
    this._resizeHandle = this.shadowRoot.getElementById('resize-handle');
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

    // Handle single-letter keyboard shortcuts for navigation
    this._shortcutHandler = (e) => {
      // Don't trigger if user is typing in an input (check composedPath for shadow DOM)
      const path = e.composedPath();
      const isTyping = path.some(el =>
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
      );
      if (isTyping) {
        return;
      }
      // Don't trigger if modifier keys are pressed
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      // Don't trigger if menu is visible (menu has its own navigation)
      if (this._menuVisible) {
        return;
      }

      const key = e.key.toLowerCase();
      const navPath = this.shortcuts[key];

      if (navPath) {
        e.preventDefault();
        this.navigate(navPath);
      }
    };
    document.addEventListener('keydown', this._shortcutHandler);

    // Handle console resize
    this._resizeMouseDown = (e) => {
      this._isResizing = true;
      this._resizeHandle.classList.add('dragging');
      this._consoleTray.classList.add('resizing');
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };
    this._resizeHandle.addEventListener('mousedown', this._resizeMouseDown);

    this._resizeMouseMove = (e) => {
      if (!this._isResizing) return;

      const containerRect = this.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      const minHeight = 48;
      const maxHeight = window.innerHeight * 0.5;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      this._consoleTray.style.height = clampedHeight + 'px';
      this._consoleHeight = clampedHeight;
    };
    document.addEventListener('mousemove', this._resizeMouseMove);

    this._resizeMouseUp = () => {
      if (this._isResizing) {
        this._isResizing = false;
        this._resizeHandle.classList.remove('dragging');
        this._consoleTray.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    document.addEventListener('mouseup', this._resizeMouseUp);
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
    if (this._shortcutHandler) {
      document.removeEventListener('keydown', this._shortcutHandler);
    }
    if (this._resizeMouseDown) {
      this._resizeHandle?.removeEventListener('mousedown', this._resizeMouseDown);
    }
    if (this._resizeMouseMove) {
      document.removeEventListener('mousemove', this._resizeMouseMove);
    }
    if (this._resizeMouseUp) {
      document.removeEventListener('mouseup', this._resizeMouseUp);
    }
  }

  /**
   * Toggle console visibility
   * @returns {boolean} New visibility state (true = visible)
   */
  toggleConsole() {
    if (this._consoleHidden) {
      // Show console
      this._consoleTray.classList.remove('hidden');
      this._resizeHandle.style.display = '';
      this._consoleTray.style.height = this._consoleHeight + 'px';
      this._consoleHidden = false;
      this._prompt?.focus();
    } else {
      // Hide console
      this._consoleHeight = this._consoleTray.offsetHeight;
      this._consoleTray.classList.add('hidden');
      this._resizeHandle.style.display = 'none';
      this._consoleHidden = true;
    }

    // Dispatch event for terminal-frame to update toggle button
    this.dispatchEvent(new CustomEvent('console:toggle', {
      detail: { hidden: this._consoleHidden },
      bubbles: true
    }));

    return !this._consoleHidden;
  }

  /**
   * Check if console is currently hidden
   * @returns {boolean}
   */
  get consoleHidden() {
    return this._consoleHidden;
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
    this.appendOutput('  home, blog, projects, work, everyday, about, contact, archive', 'system');
    this.appendOutput('', 'system');
    this.appendOutput('Keyboard shortcuts:', 'system');
    this.appendOutput('  [H]ome [B]log [W]ork [E]veryday [A]bout [C]ontact', 'system');
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
        <div class="page-content">
          <slot></slot>
        </div>
        <div class="resize-handle" id="resize-handle"></div>
        <div class="console-tray" id="console-tray" style="height: ${this._consoleHeight}px">
          <terminal-output class="console-output"></terminal-output>
          <div class="console-prompt-area">
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
      </div>
    `;
  }

  getStyles() {
    return `
      :host {
        --console-min-height: 48px;
        --console-max-height: 50vh;

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

      /* Page content area - scrollable independently */
      .page-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
      }

      /* Resize handle */
      .resize-handle {
        flex-shrink: 0;
        height: 6px;
        background: #0C3A38;
        cursor: ns-resize;
        position: relative;
        transition: background 0.15s ease;
      }

      .resize-handle:hover,
      .resize-handle.dragging {
        background: #1D7A74;
      }

      .resize-handle::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 2px;
        background: #26A69A;
        border-radius: 1px;
        opacity: 0.5;
      }

      .resize-handle:hover::after,
      .resize-handle.dragging::after {
        opacity: 1;
        background: #FFD600;
      }

      /* Console tray */
      .console-tray {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        min-height: var(--console-min-height);
        max-height: var(--console-max-height);
        border-top: 1px solid #0C3A38;
        background: rgba(0, 0, 0, 0.3);
        transition: height 0.2s ease;
      }

      .console-tray.resizing {
        transition: none;
      }

      .console-tray.hidden {
        height: 0 !important;
        min-height: 0 !important;
        border-top: none;
        overflow: hidden;
      }

      /* Console output area */
      .console-output {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
      }

      /* Console prompt area */
      .console-prompt-area {
        flex-shrink: 0;
        border-top: 1px solid #0C3A38;
        padding: 0.5rem 1rem;
        background: rgba(0, 0, 0, 0.2);
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

      /* Scrollbar styling */
      .page-content::-webkit-scrollbar,
      .console-output::-webkit-scrollbar {
        width: 8px;
      }

      .page-content::-webkit-scrollbar-track,
      .console-output::-webkit-scrollbar-track {
        background: #011518;
      }

      .page-content::-webkit-scrollbar-thumb,
      .console-output::-webkit-scrollbar-thumb {
        background: #0C3A38;
        border-radius: 4px;
      }

      .page-content::-webkit-scrollbar-thumb:hover,
      .console-output::-webkit-scrollbar-thumb:hover {
        background: #1D7A74;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        terminal-menu,
        terminal-prompt,
        .console-tray {
          transition: none;
        }
      }
    `;
  }
}

customElements.define('terminal-tui', TerminalTUI);
