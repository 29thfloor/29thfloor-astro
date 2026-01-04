# 29thfloor Project

## Architecture

- **Astro** — page structure, layouts, build-time data fetching (WordPress API)
- **Web Components** — interactive elements (terminal-*, wireframe, animations)
- **Client JS** — user-specific data (localStorage), real-time fetches

Feature implementation plans live in `docs/implementation/`.

---

# Dev Project Workflow

**This project uses a structured dev workflow. Follow it for all changes.**

## 1. Create Working Branch
Always create a working branch before making any changes.

## 2. Implementation Planning
1. Ask for a summary of what you want to do
2. Ask clarifying questions to understand the goals
3. Propose an implementation plan
4. Ask for review of the plan
5. Make requested changes and repeat review until approved
6. Store approved plan in `docs/implementation` folder
7. Commit to git

## 3. Before Coding
Ask if you're ready to start coding. If not, help resolve concerns.

## 4. While Coding
1. **ALWAYS explain changes before making them** - ensure understanding before proceeding
2. Ask for review of changes and/or testing (if possible)
3. Commit and push approved changes
4. Repeat until complete
5. When work is completed, push changes and open a PR
6. Ask for PR review

## Notes
- Break implementation plans into multiple phases to keep changes small and support learning
- No Claude references in git commits
- Use `rip` instead of `rm`
