# Terminal TUI Vision

Future direction notes for the terminal interface.

---

## Dual Navigation Modes

Two distinct ways to navigate the site:

1. **Command Line Mode** — For power users and curious visitors who want the full terminal experience
2. **Traditional Mode** — Standard website menu for visitors who just want to browse normally

### Mode Selection
- First-visit prompt asks users which they prefer
- Toggle available to switch between modes anytime
- Preference saved in localStorage

---

## Enhanced CLI Experience

### Claude Code-Style TUI
Rich terminal output that supports interactive elements:
- Questions with selectable answers
- Checklists
- Keyboard-navigable selections
- Other interaction patterns yet to be invented

### Drives Both Areas
The CLI doesn't just output to the console — it controls the entire experience:
- Console output area (command history, responses)
- Page content area (loads content, updates views)

### Split Views
Allow users to split the view:
- Horizontal split
- Vertical split
- Flexible layout for different workflows

---

## Natural Language Navigation

Move beyond rigid commands to conversational interaction:

```
> find everydays with weird skulls
> send me a message
> leave a comment on this post
> show me work from 2023
> what's new since my last visit?
```

The prompt becomes a conversational interface, not just a command parser.

---

## Interactive Actions via CLI

Things users could do through the command line:
- Filter and search content
- Leave comments
- Send messages/contact
- Save favorites
- Get personalized recommendations
- Navigate interactive elements

---

## Philosophy

- Push the boundaries of what a CLI can do on the web
- Experimental and fun — maybe silly, but memorable
- Create a unique experience that rewards exploration
- Bridge the gap between nostalgic BBS aesthetic and modern AI-powered interaction

---

## Open Questions

- How to handle the "normie" menu? Separate component or integrated?
- What's the right balance between CLI power and discoverability?
- How much natural language processing is feasible client-side vs server?
- Should split views be user-configurable or preset layouts?
