# Astro + Web Components Learning Guide

A hands-on guide built while creating the 29th Floor headless frontend.

---

## Table of Contents

1. [What is Astro?](#1-what-is-astro)
2. [Project Structure](#2-project-structure)
3. [Astro Components](#3-astro-components)
4. [Routing](#4-routing)
5. [Data Fetching](#5-data-fetching)
6. [Web Components](#6-web-components)
7. [Styling with Tailwind](#7-styling-with-tailwind)
8. [Static vs Server Rendering](#8-static-vs-server-rendering)
9. [Deployment](#9-deployment)

---

## 1. What is Astro?

### The Core Idea

Astro is an **HTML-first** framework. You write templates that look like HTML, and Astro builds them into static HTML files. No JavaScript is shipped unless you explicitly add it.

### Mental Model

Think of Astro like a modern static site generator:

| Traditional SSG | Astro |
|-----------------|-------|
| Markdown → HTML | Astro components → HTML |
| Limited templating | Full JavaScript in templates |
| Build once | Build once + optional SSR |

### Comparison to WordPress

| WordPress | Astro |
|-----------|-------|
| PHP templates | Astro components |
| `<?php echo $title; ?>` | `{title}` |
| `get_posts()` | `await fetch()` |
| Theme files | `src/pages/` |
| `functions.php` | `src/lib/` |

### Why Zero JavaScript?

Most websites are content - text, images, links. They don't need JavaScript.

Astro renders everything to HTML at build time. The browser receives pure HTML/CSS. Fast, accessible, works everywhere.

When you DO need interactivity (search box, image carousel), you add it explicitly with Web Components or framework components.

---

## 2. Project Structure

```
29thfloor-astro/
├── src/
│   ├── pages/           # Routes (each file = a page)
│   ├── layouts/         # Page wrappers (header, footer)
│   ├── components/      # Reusable Astro components
│   ├── lib/             # Utilities (API client, helpers)
│   └── styles/          # Global CSS
├── public/              # Static assets (served as-is)
│   ├── fonts/
│   └── js/components/   # Web Components
├── astro.config.mjs     # Astro configuration
└── .env                 # Environment variables
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | File-based routing. `about.astro` → `/about` |
| `src/layouts/` | Shared page structure (HTML boilerplate) |
| `src/components/` | Reusable pieces (cards, grids, nav) |
| `public/` | Static files copied directly to output |

---

## 3. Astro Components

### Basic Syntax

Astro components have two parts:

```astro
---
// FRONTMATTER (JavaScript - runs at build time on server)
const name = "World";
const items = ["one", "two", "three"];
---

<!-- TEMPLATE (HTML-like - becomes static HTML) -->
<h1>Hello, {name}!</h1>

<ul>
  {items.map(item => <li>{item}</li>)}
</ul>

<style>
  /* Scoped CSS - only affects this component */
  h1 {
    color: purple;
  }
</style>
```

### The Frontmatter (`---`)

Everything between the `---` fences runs on the server at build time:

```astro
---
// Import other components
import Card from '../components/Card.astro';

// Fetch data
const response = await fetch('https://api.example.com/posts');
const posts = await response.json();

// Define props
interface Props {
  title: string;
}
const { title } = Astro.props;

// Any JavaScript you need
const formattedDate = new Date().toLocaleDateString();
---
```

### The Template

The template part looks like HTML with some extras:

```astro
<!-- Use JavaScript expressions with curly braces -->
<h1>{title}</h1>

<!-- Conditionals -->
{showBanner && <div class="banner">Hello!</div>}

{user ? (
  <p>Welcome, {user.name}</p>
) : (
  <p>Please log in</p>
)}

<!-- Loops -->
{posts.map(post => (
  <article>
    <h2>{post.title}</h2>
  </article>
))}

<!-- Use other components -->
<Card title="My Card" />

<!-- Render raw HTML (careful with user content!) -->
<div set:html={post.content} />
```

### Props

Components receive data via props:

```astro
---
// Card.astro
interface Props {
  title: string;
  image?: string;  // optional
}

const { title, image } = Astro.props;
---

<div class="card">
  {image && <img src={image} alt="" />}
  <h2>{title}</h2>
</div>
```

Use the component:

```astro
<Card title="My Title" image="/photo.jpg" />
```

### Slots

Slots let you pass content into components:

```astro
---
// Box.astro
---
<div class="box">
  <slot />  <!-- Child content goes here -->
</div>
```

```astro
<Box>
  <p>This paragraph goes in the slot!</p>
</Box>
```

---

## 4. Routing

### File-Based Routing

The file structure in `src/pages/` defines your URLs:

```
src/pages/
├── index.astro        → /
├── about.astro        → /about
├── everyday/
│   ├── index.astro    → /everyday
│   └── [slug].astro   → /everyday/anything
└── work/
    └── index.astro    → /work
```

### Dynamic Routes

Square brackets create dynamic segments:

```astro
---
// src/pages/everyday/[slug].astro

// Tell Astro which pages to build
export async function getStaticPaths() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }  // Optional: pass data to page
  }));
}

// Access the params
const { slug } = Astro.params;
const { post } = Astro.props;  // If passed from getStaticPaths
---

<h1>{post.title}</h1>
```

### How getStaticPaths Works

1. Astro calls `getStaticPaths()` at build time
2. You return an array of all possible paths
3. Astro builds a static page for each path

```astro
export async function getStaticPaths() {
  return [
    { params: { slug: 'first-post' } },
    { params: { slug: 'second-post' } },
    { params: { slug: 'third-post' } },
  ];
}
// Builds: /everyday/first-post, /everyday/second-post, /everyday/third-post
```

---

## 5. Data Fetching

### Fetching in Frontmatter

Since frontmatter runs on the server, you can fetch directly:

```astro
---
// This runs at build time, not in the browser
const response = await fetch('https://29thfloor.com/wp-json/wp/v2/everyday');
const posts = await response.json();
---

<ul>
  {posts.map(post => (
    <li>{post.title.rendered}</li>
  ))}
</ul>
```

### API Client Pattern

For reusable fetch logic:

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.WORDPRESS_API_URL;

export async function getEverydayPosts() {
  const response = await fetch(`${API_URL}/everyday`);
  return response.json();
}
```

```astro
---
import { getEverydayPosts } from '../lib/api';

const posts = await getEverydayPosts();
---
```

### Environment Variables

```env
# .env
WORDPRESS_API_URL=https://29thfloor.com/wp-json/wp/v2
```

Access with `import.meta.env.VARIABLE_NAME`:

```astro
---
const apiUrl = import.meta.env.WORDPRESS_API_URL;
---
```

---

## 6. Web Components

### What Are Web Components?

Web Components are a browser-native way to create custom HTML elements. No framework needed - they work everywhere.

Three main technologies:
1. **Custom Elements** - Define new HTML tags
2. **Shadow DOM** - Encapsulated styles (optional)
3. **HTML Templates** - Reusable markup (optional)

### Basic Custom Element

```javascript
// public/js/components/hello-world.js

class HelloWorld extends HTMLElement {
  connectedCallback() {
    // Called when element is added to page
    this.innerHTML = `<p>Hello, World!</p>`;
  }
}

// Register the custom element
customElements.define('hello-world', HelloWorld);
```

Use it in HTML:

```html
<script src="/js/components/hello-world.js" type="module"></script>

<hello-world></hello-world>
```

### Lifecycle Methods

```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    // Called when element is created
    // Don't access DOM here yet
  }

  connectedCallback() {
    // Called when added to page
    // Safe to access DOM, set up event listeners
  }

  disconnectedCallback() {
    // Called when removed from page
    // Clean up event listeners, timers
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Called when observed attribute changes
  }

  static get observedAttributes() {
    // List attributes to watch
    return ['title', 'src'];
  }
}
```

### Reading Attributes

```javascript
class UserCard extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute('name');
    const avatar = this.getAttribute('avatar');

    this.innerHTML = `
      <div class="card">
        <img src="${avatar}" alt="" />
        <h2>${name}</h2>
      </div>
    `;
  }
}

customElements.define('user-card', UserCard);
```

```html
<user-card name="Daniel" avatar="/photo.jpg"></user-card>
```

### Using Data Attributes

For complex data, use `data-*` attributes:

```html
<gif-hover
  data-static="/thumb.jpg"
  data-animated="/full.gif"
>
  <img src="/thumb.jpg" />
</gif-hover>
```

```javascript
class GifHover extends HTMLElement {
  connectedCallback() {
    const staticSrc = this.dataset.static;   // dataset reads data-* attrs
    const animatedSrc = this.dataset.animated;
    const img = this.querySelector('img');

    this.addEventListener('mouseenter', () => img.src = animatedSrc);
    this.addEventListener('mouseleave', () => img.src = staticSrc);
  }
}
```

### Event Handling

```javascript
class ToggleButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button>Toggle</button>`;

    const button = this.querySelector('button');
    let isOn = false;

    button.addEventListener('click', () => {
      isOn = !isOn;
      this.classList.toggle('is-on', isOn);

      // Dispatch custom event for parent components
      this.dispatchEvent(new CustomEvent('toggle', {
        detail: { isOn },
        bubbles: true
      }));
    });
  }
}
```

### Using Web Components in Astro

```astro
---
// The component renders static HTML
const items = ['one', 'two', 'three'];
---

<!-- Static content from Astro -->
<div class="container">
  {items.map(item => (
    <expandable-section data-title={item}>
      <p>Content for {item}</p>
    </expandable-section>
  ))}
</div>

<!-- Load the Web Component script -->
<script src="/js/components/expandable-section.js" type="module"></script>
```

---

## 7. Styling with Tailwind

### What is Tailwind?

Utility-first CSS framework. Instead of writing CSS classes, you apply utilities directly:

```html
<!-- Traditional CSS -->
<div class="card">

<!-- Tailwind -->
<div class="p-4 border border-gray-300 rounded-lg shadow-md">
```

### Common Utilities

| Utility | CSS |
|---------|-----|
| `p-4` | `padding: 1rem` |
| `m-2` | `margin: 0.5rem` |
| `mt-4` | `margin-top: 1rem` |
| `px-2` | `padding-left: 0.5rem; padding-right: 0.5rem` |
| `flex` | `display: flex` |
| `grid` | `display: grid` |
| `gap-4` | `gap: 1rem` |
| `text-lg` | `font-size: 1.125rem` |
| `font-bold` | `font-weight: 700` |
| `text-white` | `color: white` |
| `bg-black` | `background-color: black` |
| `border` | `border: 1px solid` |
| `rounded` | `border-radius: 0.25rem` |
| `w-full` | `width: 100%` |
| `h-64` | `height: 16rem` |

### Responsive Design

Prefix with breakpoint:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

| Prefix | Breakpoint |
|--------|------------|
| (none) | Default (mobile) |
| `sm:` | 640px+ |
| `md:` | 768px+ |
| `lg:` | 1024px+ |
| `xl:` | 1280px+ |

### States

```html
<button class="bg-blue-500 hover:bg-blue-700 focus:ring-2">
  Click me
</button>
```

### Custom Colors

In `tailwind.config.mjs`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        teal: {
          500: '#26A69A',
          950: '#011518',
        },
        yellow: {
          500: '#FFD600',
        },
      },
    },
  },
};
```

Use as `text-teal-500`, `bg-yellow-500`, etc.

---

## 8. Static vs Server Rendering

### Static Generation (Default)

Pages are built once at deploy time:

```astro
---
// This runs at BUILD time, not when users visit
const posts = await fetch('...').then(r => r.json());
---

<!-- HTML is generated once, served to all visitors -->
<ul>
  {posts.map(post => <li>{post.title}</li>)}
</ul>
```

**Pros:** Fastest possible, cheap to host (just files)
**Cons:** Need to rebuild to update content

### Server-Side Rendering

Pages are built on each request:

```astro
---
// Tell Astro to render on server
export const prerender = false;

// This runs on EVERY request
const posts = await fetch('...').then(r => r.json());
---
```

**Pros:** Always fresh content
**Cons:** Slower, needs server

### Hybrid Mode (Our Approach)

In `astro.config.mjs`:

```javascript
export default defineConfig({
  output: 'hybrid',  // Static by default, opt-in to SSR
});
```

- Most pages are static (fast, cheap)
- Add `export const prerender = false` where needed

---

## 9. Deployment

### Vercel Setup

1. **Import repo**: Go to https://vercel.com/new and import `29thfloor/29thfloor-astro`
2. **Environment variables**: Add `WORDPRESS_API_URL` = `https://29thfloor.com/wp-json/wp/v2`
3. **Deploy**: Vercel auto-detects Astro and builds

### vercel.json Configuration

```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- . ':!docs' ':!*.md'"
}
```

The `ignoreCommand` skips builds when only documentation files change.

### Preview Deployments

Every PR branch gets an automatic preview deployment:
- Push to a branch → Vercel creates preview URL
- Merge to main → Vercel deploys to production

### Git Workflow

```
main (production)
  │
  └── feature/my-feature (preview)
```

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push: `git push -u origin feature/my-feature`
4. Create PR: `gh pr create`
5. Test on preview URL
6. Merge PR: `gh pr merge --merge --delete-branch`

### Merge Strategies

| Strategy | What it does |
|----------|--------------|
| `--merge` | Keeps all commits, adds merge commit |
| `--squash` | Combines all commits into one |
| `--rebase` | Replays commits on top of main |

### Production URL

https://29thfloor-astro.vercel.app

---

## Commands Reference

```bash
# Development
npm run dev          # Start dev server (localhost:4321)

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Other
npx astro add X      # Add integration (tailwind, vercel, etc.)
npx astro check      # Type-check the project
```

---

## Glossary

| Term | Definition |
|------|------------|
| **Astro Component** | `.astro` file with frontmatter + template |
| **Frontmatter** | JavaScript between `---` fences, runs on server |
| **Static Generation** | Build pages once at deploy time |
| **SSR** | Server-Side Rendering, build on each request |
| **Hybrid** | Mix of static and SSR in same project |
| **Web Component** | Browser-native custom element |
| **Custom Element** | JavaScript class that defines new HTML tag |
| **Slot** | Placeholder for child content in components |

---

## Session Log

### December 27, 2025

**Completed:**
- Built all core pages (home, everyday, work, blog)
- Implemented pagination for everyday archive (50 posts per page)
- Added prev/next navigation to single everyday posts
- Created GIF hover Web Component
- Fixed URL encoding for special characters in slugs
- Added Tailwind Typography plugin for blog content
- Created shared `decodeEntities` utility for HTML entities
- Deployed to Vercel (https://29thfloor-astro.vercel.app)
- Set up feature branch workflow with PRs
- Configured Vercel to skip builds for docs-only changes

**Files created:**
- `src/layouts/Base.astro` - Base HTML layout
- `src/pages/index.astro` - Home page
- `src/pages/everyday/[...page].astro` - Paginated archive
- `src/pages/everyday/[slug].astro` - Single post
- `src/pages/work/index.astro` - Work archive
- `src/pages/work/[slug].astro` - Single work post
- `src/pages/blog/index.astro` - Blog archive
- `src/pages/blog/[slug].astro` - Single blog post
- `src/components/EverydayCard.astro` - Card component
- `src/lib/api.ts` - WordPress API client
- `src/lib/utils.ts` - Shared utilities
- `src/styles/global.css` - Tailwind theme
- `public/js/components/gif-hover.js` - Web Component
- `vercel.json` - Vercel configuration

**Lessons learned:**
- Import CSS in Astro frontmatter, not in `<style>` tags
- Restart dev server when adding new Tailwind classes
- Use `is:global` for styles targeting `set:html` content
- Decode URL-encoded slugs from WordPress API
- Use feature branches + PRs instead of committing to main
