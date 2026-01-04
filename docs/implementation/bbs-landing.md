# BBS Landing Page Implementation Plan

## Workflow Reminder

> **STOP before every edit.** Explain what you're changing and wait for approval.
> See project CLAUDE.md for full workflow.

---

## Concept

Replace the content-heavy home page with a classic BBS welcome screen that matches the ANSI demoscene aesthetic. The landing features the SVG logo with color cycling, a snarky AI system message, BBS-style navigation menu, fake system stats, recent blog posts, a 16-bit SysOp photo, demoscene greets, and a mysterious animated element.

**Architecture:** See `CLAUDE.md` for project-wide Astro + Web Components pattern.

---

## Visual Layout

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                      [SVG LOGO: 29F_]                            ║
║                    (color cycling glow)                          ║
║                                                                  ║
║══════════════════════════════════════════════════════════════════║
║                                                                  ║
║  SYSTEM MESSAGE:                                                 ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │ Welcome back, traveler. You've been gone 847 days.       │   ║
║  │ I kept the lights on. You're welcome.                    │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║──────────────────────────────────────────────────────────────────║
║                                                                  ║
║  MAIN MENU                         SYSTEM STATUS                 ║
║  ─────────                         ─────────────                 ║
║  [B]log ......... 12 entries       UPTIME: 29y 4m 17d            ║
║  [W]ork ......... 8 projects       VISITORS: 1,337               ║
║  [E]veryday ..... 365+ posts       LAST CALLER: YOU              ║
║  [A]bout                           NODE: 7 OF 7                  ║
║  [C]ontact                         STATUS: NOMINAL               ║
║                                                                  ║
║──────────────────────────────────────────────────────────────────║
║                                                                  ║
║  RECENT TRANSMISSIONS              SYSOP                         ║
║  ────────────────────              ─────                         ║
║  → Blog Post Title One             ┌─────────┐                   ║
║  → Blog Post Title Two             │ ▓▓▓▓▓▓▓ │                   ║
║  → Blog Post Title Three           │ ▓ photo ▓│  DANIEL          ║
║                                    │ ▓▓▓▓▓▓▓ │  MCFARLAND        ║
║                                    └─────────┘                   ║
║                                    Location: PDX                 ║
║                                                                  ║
║            ◈ [MYSTERIOUS ANIMATED ELEMENT] ◈                     ║
║                                                                  ║
║══════════════════════════════════════════════════════════════════║
║  ░░░ GREETS TO: Future Farmers • Superflat • The Void ░░░░░░░░░  ║
╚══════════════════════════════════════════════════════════════════║
```

---

## Elements

| Element | Description |
|---------|-------------|
| **SVG Logo** | Existing 29F_ logo with animated gradient color cycling (teal → yellow → magenta → teal). Glow effect. |
| **System Message** | Snarky AI greeting. Calculates "days since last visit" from localStorage. Rotates through messages on each visit. |
| **Main Menu** | BBS-style with `[L]etter` shortcuts. Dot leaders. Shows real counts from WordPress API. Keyboard shortcuts work (B, W, E, A, C). |
| **System Status** | Fake stats. Uptime counts from site "launch date" (1995-ish for fun). Visitors always 1,337. Node 7 of 7. Status: NOMINAL. |
| **Recent Transmissions** | Latest 3 blog posts from API, styled as intercepted signals. Links to posts. |
| **SysOp** | Photo of Daniel with heavy dithering/16-bit treatment (CSS or pre-processed image). Name + location. |
| **Mysterious Element** | Slowly rotating wireframe shape with color cycling. Not interactive. Pure demoscene vibes. (Future: add more variants) |
| **Greets** | Demoscene-style shoutouts. Could be static or slowly scroll/color cycle. Mix of real and fictional group names. |

---

## Snarky System Messages

Randomly selected on page load:

1. "Welcome back, traveler. You've been gone {N} days. I kept the lights on. You're welcome."
2. "Oh, it's you. I was just about to defrag. Come in, I guess."
3. "ALERT: Unidentified user detected. Just kidding. I know it's you."
4. "System check complete. All pixels accounted for."
5. "You have 0 new messages. As usual. I'm not judging."
6. "Connection established. Try not to break anything this time."
7. "Welcome to the 29th floor. Mind the gap between reality and render."
8. "Initializing nostalgia protocols... Done. Welcome home."

For returning visitors, calculate days since last visit using localStorage timestamp.

---

## Implementation Phases

### Phase 1: Prototype Page
**File:** `prototypes/bbs-landing.html`

Create standalone HTML prototype with:
- SVG logo (copy from existing prototype)
- Color cycling animation
- Static layout of all elements
- CSS styling for BBS aesthetic

This lets us iterate on the design before integrating with Astro.

### Phase 2: Astro Component
**File:** `src/components/BBSLanding.astro`

Convert prototype to Astro component:
- Fetch real blog post data
- Fetch work/everyday counts
- Pass data to component
- Handle snarky message selection
- Calculate days since last visit

### Phase 3: Update Home Page
**File:** `src/pages/index.astro`

- Remove existing content sections
- Import and use BBSLanding component
- Ensure it works within terminal-tui wrapper

### Phase 4: Keyboard Navigation
**File:** Update `terminal-tui.js` or add to BBSLanding

- Wire keyboard shortcuts (B, W, E, A, C)
- Menu items integrate with terminal commands
- Clicking menu items works same as typing command

### Phase 5: Visual Polish
- Fine-tune color cycling speed
- Add glow/shadow effects
- Mysterious element animation
- Greets section styling (optional scroll)
- `prefers-reduced-motion` support
- Mobile responsive layout

### Phase 6: SysOp Photo
- Source or create 16-bit dithered photo
- Could be CSS filter effect or pre-processed image
- Add to assets and reference in component

---

## Files to Create

| File | Purpose |
|------|---------|
| `prototypes/bbs-landing.html` | Standalone prototype for design iteration |
| `src/components/BBSLanding.astro` | Main landing page component |
| `src/components/wireframe-shape.js` | Rotating wireframe web component |
| `src/assets/sysop-photo.png` | 16-bit dithered photo (swap placeholder when ready) |

**Already created:**
- `src/assets/sysop-placeholder.svg` — Placeholder portrait with dithering effect

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/index.astro` | Replace content with BBSLanding component |
| `src/components/terminal-tui.js` | Add keyboard shortcuts for BBS menu (if needed) |

---

## Technical Notes

### Color Cycling
Use SVG `<animate>` for gradient color cycling (already in logo prototype):
```html
<linearGradient id="gradient-full">
  <stop offset="0%" stop-color="#26A69A">
    <animate attributeName="stop-color"
             values="#26A69A;#FFD600;#FF0080;#26A69A"
             dur="4s" repeatCount="indefinite"/>
  </stop>
</linearGradient>
```

### Days Since Last Visit
```javascript
const lastVisit = localStorage.getItem('lastVisit');
const now = Date.now();
if (lastVisit) {
  const days = Math.floor((now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
  // Use in message
}
localStorage.setItem('lastVisit', now.toString());
```

### Mysterious Element
Starting with: **Slowly rotating wireframe shape** (cube or icosahedron)

Future variants to consider:
- Pulsing geometric sigil (triangle, hexagon, eye)
- Glitched/corrupted text that shifts
- Waveform visualization
- Constellation that subtly moves
- Binary/hex that cycles through values

### 16-bit Photo Effect
CSS approach:
```css
.sysop-photo {
  image-rendering: pixelated;
  filter: contrast(1.1) saturate(0.8);
}
```
Or pre-process image with dithering tool.

---

## Design Tokens

Using existing terminal color palette:
- `--term-bg: #011518` (dark background)
- `--term-text: #26A69A` (teal text)
- `--term-accent: #FFD600` (yellow highlights)
- `--term-dim: #0C3A38` (muted elements)
- `--term-highlight: #1D7A74` (hover states)

Additional colors for effects:
- `#FF0080` (magenta for color cycling)
- `#00FFFF` (cyan for glitch effects)

---

## Responsive Considerations

- On mobile, stack the two-column sections vertically
- Logo scales down but remains prominent
- Menu items get larger touch targets
- Mysterious element may be smaller or hidden on mobile
- Greets section may wrap or truncate

---

## Accessibility

- All menu items are focusable and have visible focus states
- Color cycling respects `prefers-reduced-motion`
- Alt text on SysOp photo
- Semantic HTML structure
- Keyboard navigation works throughout
