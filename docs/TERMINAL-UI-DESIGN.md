# Terminal UI Design

A cyberpunk terminal interface for 29thfloor.com.

---

## Concept

The site presents as a **smart terminal** — a retro-futuristic computer interface that accesses information about Daniel McFarland's work and world.

- **Terminal mode**: ASCII art, monospace text, keyboard navigation
- **Viewport mode**: High-resolution content display (images, video, embeds)

The terminal is the frame. The content is the payload.

---

## Aesthetic

| Element | Style |
|---------|-------|
| Era | 16-bit, late 80s/early 90s |
| Genre | Cyberpunk |
| References | Snatcher, Shadowrun SNES, Blade Runner, Alien terminals |
| Colors | Teal glow on dark, yellow/amber accents |
| Typography | Monospace (Fira Code), pixel font for headers |
| Borders | ASCII box-drawing characters |
| Effects | Scanlines (subtle), text glow, typing animations |

---

## Color Palette

Already established, fits cyberpunk naturally:

```
Background:  #011518 (teal-950) — Night/void
Text:        #26A69A (teal-500) — Terminal glow
Accent:      #FFD600 (yellow-500) — Neon/warning
Dim:         #0C3A38 (teal-800) — Inactive/borders
Highlight:   #1D7A74 (teal-600) — Hover states
```

Additional colors (used in prototypes):
- `#00FFFF` — Cyan for glitch effects
- `#FF0080` — Magenta/pink for glitch effects, alerts
- `#00FF00` — Classic terminal green (optional throwback)

---

## ASCII Art

### Logo

**Option A — Clean block:**

```
██████╗  ██████╗ ███████╗
╚════██╗██╔═══██╗██╔════╝
 █████╔╝╚██████╔╝█████╗
██╔═══╝  ╚═══██║ ██╔══╝
███████╗ █████╔╝ ██║     ███
╚══════╝ ╚════╝  ╚═╝
```

**Option B — ACiD/BBS style with shading:**

```

      ░▒▓██████▓▒  ▒▓██████▓▒░  ▒▓████████▓▒░
      ░░░░░░▒▓██▌  ▓██▒░░▒██▓   ▓██▒░░░░░░░
           ░▓██▌  ░▓██░  ▓██▒   ▓██▒
      ░▒▓█████▓░   ▒▓█████▓▒    ▓█████▓▒░
      ▓██▒░░░░░      ░░░▓██▒    ▓██▒░░░░
      ▓██▓▓▓▓▓▓▒░  ▒▓█████▓░    ▓██▒       ▓▓▓▓▓▓▓▓▓▓▓▓
      ░▀▀▀▀▀▀▀▀░   ░▀▀▀▀▀▀░     ░▀▀        ▀▀▀▀▀▀▀▀▀▀▀▀

```

Reference: ACiD Productions, iCE, 90s BBS ANSI art scene.

The underscore block blinks via CSS animation.

### SVG Logo Implementation

Working prototypes: [`prototypes/svg-ascii-logo-v2.html`](../prototypes/svg-ascii-logo-v2.html)

The logo is built with SVG using a block-based approach inspired by ASCII art:

**Technical approach:**
- Each "character" composed of small rectangles on a grid
- 6 shading levels for depth (b100, b80, b60, b40, b20, b10)
- Grayscale SVG masks where brightness = opacity
- Allows gradients, animations, and effects while maintaining the blocky aesthetic

**Effects implemented:**
1. **Glow on hover** — CSS `drop-shadow` with increased intensity
2. **Animated gradient** — SVG `<animate>` cycling through teal → yellow → magenta → cyan
3. **Glitch/chromatic aberration** — Cyan and magenta offset clones on hover
4. **Scanlines** — CSS pseudo-element overlay
5. **Interactive colors** — JavaScript color picker with pulse animation

**Preferred combination:** Animated gradient + scanlines + glitch on hover (Demo 2)

### Section Headers

_TODO: Add ASCII headers for each section_

### Decorative Elements

_TODO: Add dividers, corners, borders_

---

## Site Structure

```
┌─────────────────────────────────────────────┐
│  29F_ TERMINAL                              │
├─────────────────────────────────────────────┤
│                                             │
│  > PROFILE         Character sheet / bio    │
│    PROJECTS        Work / completed quests  │
│    EVERYDAYS       Archive [2014-2025]      │
│    TRANSMISSIONS   Blog / writing           │
│    CODEX           World documentation      │
│    CONTACT         Party invite / co-op     │
│                                             │
└─────────────────────────────────────────────┘
```

### Section Mapping

| Section | Content | Game Metaphor |
|---------|---------|---------------|
| PROFILE | Bio, avatar, skills, experience | Character sheet |
| PROJECTS | Portfolio work | Completed quests |
| EVERYDAYS | Daily art archive (2014-2025) | Grind log / achievements |
| TRANSMISSIONS | Blog posts, writing | Intercepted signals / lore |
| CODEX | Essays on tech, culture, the era | World encyclopedia |
| CONTACT | How to reach me | Co-op request |

---

## UI Components

### Terminal Frame

```
╔══════════════════════════════════════════════╗
║  29F_ TERMINAL v2.0              ◀ ▪ ▪ ▪ ▶  ║
╠══════════════════════════════════════════════╣
║                                              ║
║  Content area                                ║
║                                              ║
╠══════════════════════════════════════════════╣
║  STATUS: ONLINE    UPLINK: ████████░░ 80%   ║
╚══════════════════════════════════════════════╝
```

### Menu Item

```
  > ACTIVE SELECTION     ← Arrow indicator, highlighted
    Inactive item        ← Dimmed
    Inactive item
```

### Content Card (ASCII)

```
┌──────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Thumbnail placeholder
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
├──────────────────────────┤
│  PROJECT TITLE           │
│  2024.03.15              │
└──────────────────────────┘
```

### Viewport (High-Res Content)

When content is selected, it opens in a clean viewport:

```
╔══════════════════════════════════════════════╗
║  VIEWING: project-name.jpg          [CLOSE]  ║
╠══════════════════════════════════════════════╣
║                                              ║
║     ┌────────────────────────────────┐       ║
║     │                                │       ║
║     │    ACTUAL HIGH-RES IMAGE       │       ║
║     │                                │       ║
║     │                                │       ║
║     └────────────────────────────────┘       ║
║                                              ║
║  ◀ PREV                          NEXT ▶     ║
╚══════════════════════════════════════════════╝
```

---

## Interactions

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate menu items |
| `Enter` | Select / Open |
| `Esc` | Back / Close viewport |
| `?` | Help / Commands |
| `/` | Search (future) |

### Mouse

- Click to select
- Hover shows highlight state
- Works fully without keyboard

### Typing Effect

Optional text reveal animation:
- New text "types" onto screen
- Skippable (click or key to complete instantly)
- Subtle — not slow enough to annoy

### Sound (Optional)

- Key clicks on navigation
- Blip on selection
- Ambient hum (toggle-able)
- Mute by default, opt-in

---

## Technical Approach

### Web Components

| Component | Purpose |
|-----------|---------|
| `<terminal-frame>` | Main container with header/footer |
| `<terminal-menu>` | Keyboard-navigable menu |
| `<terminal-card>` | ASCII-bordered content preview |
| `<content-viewport>` | High-res content viewer/lightbox |
| `<typing-text>` | Animated text reveal |
| `<ascii-art>` | Render ASCII art blocks |

### CSS

- Monospace font stack
- CSS custom properties for theming
- `text-shadow` for glow effects
- Pseudo-elements for scanlines
- CSS Grid for terminal layout
- `@media (prefers-reduced-motion)` for accessibility

### Accessibility

- Full keyboard navigation
- Screen reader support (ARIA labels)
- Skip animation option
- High contrast maintained
- Semantic HTML under the ASCII styling
- Fallback for no-JS: static HTML still readable

---

## Open Questions

1. **Home/landing page**: Literal "PRESS START" or straight into menu? Maybe more like a BBS menu

2. **Loading states**: Fake "connecting" sequences? How much is too much? Nothing that slows down the user flow, but definitely include lots of loading states and subtle animations

3. **Mobile**: How does terminal UI adapt? Simplified? Same but touch? Open to suggestions

4. **ASCII art**: Hand-craft each piece or generate? Mix? Probably generate based on photo/illustration

5. **Profile section**: What stats/skills to show? Literal game stats? Things that sound like game stats but include life experience and human traits

6. **Codex content**: What topics? Tech history? Cultural observations? Anything I'm interested in.

7. **Sound**: Worth the effort? Adds atmosphere but also complexity. Some subtle sounds would be nice.

8. **Transitions**: Page transitions or SPA-style content swapping? Let's consider both

---

## References / Inspiration

- Snatcher (Sega CD, 1994)
- Shadowrun (SNES, 1993)
- Blade Runner (film, 1982)
- Alien ship computer terminals
- Cool Retro Term (terminal emulator)
- Cathode (macOS terminal app)
- [Poolside.fm](https://poolside.fm) — retro UI on modern web
- [Hypnospace Outlaw](https://www.hypnospace.net) — fake retro OS

---

## Next Steps

1. [ ] Answer open questions above
2. [x] Sketch ASCII art for key elements (logo) — see [SVG prototypes](../prototypes/svg-ascii-logo-v2.html)
3. [ ] Create ASCII section headers
4. [ ] Prototype terminal-frame Web Component
5. [ ] Define content for PROFILE section (what stats/skills?)
6. [ ] Plan CODEX topics
7. [ ] Decide on sound design (yes/no/later)

---

## Notes

_Space for ideas, sketches, random thoughts_


