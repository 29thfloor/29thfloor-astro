# Terminal TUI System Implementation Plan

A TUI (Terminal User Interface) that looks like a terminal but functions as a responsive website with keyboard AND mouse/touch navigation.

---

## Core Concept

- **Command prompt** as primary interaction (`> _`)
- **Scrollback history** preserves previous interactions
- **Dual input**: keyboard navigation AND clickable elements
- **Menu command** for navigation between sections

---

## Component Architecture

```
<terminal-frame>              (existing - visual wrapper)
  └── <terminal-tui>          (new - orchestrator)
        ├── <terminal-output> (new - scrollback container)
        ├── <terminal-menu>   (new - navigable menu)
        └── <terminal-prompt> (new - command input)
```

---

## Implementation Phases

### Phase 1: Terminal Prompt
**File:** `src/components/terminal-prompt.js`

- Text input with `> ` prefix and blinking cursor
- Enter to submit command
- Escape to clear
- `prompt:submit` event with command text
- Mobile-friendly (virtual keyboard handling)

### Phase 2: Terminal Menu
**File:** `src/components/terminal-menu.js`

Visual:
```
Where to next?

   Home
   Blog
 > Projects
   Work
   Everyday
   Contact
```

- Arrow keys move `>` indicator
- Enter confirms selection
- Mouse hover highlights, click selects
- Touch-friendly (44px min targets)
- `menu:confirm` event with selected item

### Phase 3: Terminal Output
**File:** `src/components/terminal-output.js`

- Scrollable container for history
- Auto-scroll to bottom on new content
- `append(content)` method
- Supports HTML content for page content

### Phase 4: Terminal TUI (Orchestrator)
**File:** `src/components/terminal-tui.js`

- State management (output history, menu state)
- Command parsing and execution
- Session persistence via `sessionStorage`
- Greeting message on first load
- Keyboard event coordination

**Commands:**
| Command | Action |
|---------|--------|
| `menu` | Show navigation menu |
| `help` | Show available commands |
| `clear` | Clear scrollback |
| Direct nav: `home`, `blog`, `work`, `everyday`, `contact` |

### Phase 5: Layout Integration
**File:** `src/layouts/Base.astro` (modify)

- Wrap page content in TUI components
- Page content renders in scrollback
- State persists across page navigation
- Fallback: static HTML works without JS

### Phase 6: Visual Polish
- Fade-in animations for new content
- Transition effects
- `prefers-reduced-motion` support

---

## User Flow Example

1. User lands on site → greeting message + prompt
2. Types `menu` → navigation menu appears
3. Arrow down to "Projects" → `>` moves
4. Press Enter (or click) → navigates to `/work`
5. New page loads → "Connected to WORK" + content + prompt
6. User can scroll up to see previous interactions

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/terminal-prompt.js` | Command input |
| `src/components/terminal-menu.js` | Navigation menu |
| `src/components/terminal-output.js` | Scrollback container |
| `src/components/terminal-tui.js` | Main orchestrator |
| `prototypes/terminal-tui-test.html` | Isolated test page |

## Files to Modify

| File | Changes |
|------|---------|
| `src/layouts/Base.astro` | Add TUI wrapper around content |
| `docs/implementation/terminal-frame.md` | Update with TUI integration notes |

---

## Navigation Mapping

| Menu Item | Path | Status |
|-----------|------|--------|
| Home | `/` | Exists |
| Blog | `/blog` | Exists |
| Projects | `/projects` | New page (parent of Everyday) |
| Work | `/work` | Exists |
| About | `/about` | New page |
| Contact | `/contact` | New page |
| Archive | `/archive` | New page |

**Note:** Everyday (`/everyday`) is a sub-section of Projects, not a top-level menu item.

---

## Key Decisions

- **Full page navigation** (not SPA) — each section is a page load, TUI state persists via sessionStorage
- **Scrollback preserved** — previous interactions visible when scrolling up
- **Instant transitions** — no typing delay, but smooth fade-in effects
- **Web Components** — vanilla JS, no framework dependency
