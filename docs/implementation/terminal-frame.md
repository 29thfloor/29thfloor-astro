# Terminal Frame Implementation Plan

## Overview

A Web Component (`<terminal-frame>`) that provides the terminal frame container with header, content slot, and status footer.

---

## Phases

### Phase 1: Basic Structure

- Create `src/components/terminal-frame.js` (vanilla Web Component)
- Shadow DOM with slots for content
- Structure:
  - **Header**: title ("29F_ TERMINAL"), optional status indicators
  - **Content**: `<slot>` for page content
  - **Footer**: status line with customizable text

### Phase 2: Styling

- ASCII box-drawing borders (╔ ═ ╗ ║ ╚ ╝ ╠ ╣)
- Color palette from design doc:
  - Background: `#011518` (teal-950)
  - Text: `#26A69A` (teal-500)
  - Accent: `#FFD600` (yellow-500)
  - Dim: `#0C3A38` (teal-800)
  - Highlight: `#1D7A74` (teal-600)
- Text glow effect (`text-shadow`)
- Scanlines overlay (CSS pseudo-element)
- Responsive sizing

### Phase 3: Test Page

- Create `prototypes/terminal-frame-test.html` to view in isolation
- Demo with sample content

---

## Component API

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | "29F_ TERMINAL v2.0" | Header text |
| `status` | string | "ONLINE" | Footer status text |
| `no-scanlines` | boolean | false | Disable scanline effect |

### Slots

| Slot | Description |
|------|-------------|
| (default) | Main content area |

### Usage

```html
<terminal-frame title="29F_ TERMINAL v2.0" status="ONLINE">
  <p>Content goes here</p>
</terminal-frame>
```

---

## Out of Scope

- Sound effects (separate feature)
- Typing animations (`<typing-text>` component)
- Keyboard navigation (`<terminal-menu>` component)
- Status bar animations/progress indicators (future enhancement)

---

## Files

- `src/components/terminal-frame.js` — Web Component
- `prototypes/terminal-frame-test.html` — Isolated test page

---

## Reference

- Design doc: `docs/TERMINAL-UI-DESIGN.md`
- Logo prototype: `prototypes/svg-ascii-logo-v2.html`
- Section headers: `prototypes/svg-section-headers.html`
