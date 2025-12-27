# Astro Headless Frontend Plan

This document outlines the plan for building an Astro frontend that consumes the WordPress REST API.

---

## Decisions

| Decision | Choice |
|----------|--------|
| Framework | Astro |
| Interactivity | Native Web Components |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Static Generation | Hybrid (recent posts static, older via SSR) |
| Project Location | Separate repository |

---

## Why Astro + Web Components

- **HTML-first** - Write HTML templates, not JSX
- **Zero JS by default** - Ships pure HTML/CSS unless you add interactivity
- **Web Components** - Browser-native, no framework lock-in
- **Transferable skills** - Web Components work everywhere (even WordPress)
- **Future-proof** - Web standards, not library conventions

---

## Architecture

```
WordPress (29thfloor.com)          Astro Frontend (Vercel)
        ↓                                    ↓
   REST API                          Static/SSR pages
   - /wp-json/wp/v2/everyday         - /everyday (archive)
   - /wp-json/wp/v2/work             - /everyday/[slug]
   - /wp-json/wp/v2/medium           - /work (archive)
   - /wp-json/wp/v2/posts            - /work/[slug]

[WordPress Theme Repo]             [Astro Repo] ← NEW
   - Admin interface                  - Public frontend
   - REST API config                  - Deploys to Vercel
   - Deploys via rsync
```

---

## Phase 1: Project Setup

### 1.1 Create Astro Project

```bash
npm create astro@latest 29thfloor-astro
# Choose: Empty project
# Choose: Yes to TypeScript (strict)
# Choose: Yes to install dependencies

cd 29thfloor-astro
npx astro add tailwind
git init
git remote add origin git@github.com:29thfloor/29thfloor-astro.git
```

### 1.2 Project Structure

```
29thfloor-astro/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   ├── everyday/
│   │   │   ├── index.astro          # Everyday archive grid
│   │   │   └── [slug].astro         # Single everyday post
│   │   ├── work/
│   │   │   ├── index.astro          # Work archive
│   │   │   └── [slug].astro         # Single work post
│   │   └── blog/
│   │       ├── index.astro          # Blog archive
│   │       └── [slug].astro         # Single blog post
│   ├── layouts/
│   │   └── Base.astro               # Base HTML layout
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   ├── EverydayGrid.astro
│   │   ├── EverydayCard.astro
│   │   └── Pagination.astro
│   ├── lib/
│   │   └── api.ts                   # WordPress API client
│   └── styles/
│       └── global.css               # Tailwind + custom styles
├── public/
│   ├── fonts/                       # Custom fonts (Fira Code)
│   └── js/
│       └── components/              # Web Components
│           ├── gif-hover.js
│           └── media-player.js
├── astro.config.mjs
├── tailwind.config.mjs
└── .env
```

### 1.3 Environment Variables

```env
# .env
WORDPRESS_API_URL=https://29thfloor.com/wp-json/wp/v2
```

### 1.4 Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',  // Static by default, SSR where needed
  adapter: vercel(),
  integrations: [tailwind()],
});
```

### 1.5 Tailwind Configuration

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        teal: {
          500: '#26A69A',
          600: '#1D7A74',
          700: '#155A56',
          800: '#0C3A38',
          900: '#0C2A2F',
          950: '#011518',
        },
        yellow: {
          500: '#FFD600',
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

---

## Phase 2: WordPress API Client

### 2.1 Type Definitions

```typescript
// src/lib/api.ts

export interface EverydayPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  medium: number[];
  toolset_fields: {
    image: string;
    image_thumbnail: string;
    audio: string;
    embed: string;
  };
}

export interface WorkPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  toolset_fields: {
    work_images: string[];
  };
}

export interface MediumTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}
```

### 2.2 API Functions

```typescript
// src/lib/api.ts

const API_URL = import.meta.env.WORDPRESS_API_URL;

export async function getEverydayPosts(page = 1, perPage = 50) {
  const res = await fetch(
    `${API_URL}/everyday?per_page=${perPage}&page=${page}`
  );

  if (!res.ok) throw new Error('Failed to fetch everyday posts');

  const posts = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '0');

  return { posts, total, totalPages };
}

export async function getEverydayBySlug(slug: string) {
  const res = await fetch(`${API_URL}/everyday?slug=${slug}`);

  if (!res.ok) return null;

  const posts = await res.json();
  return posts[0] || null;
}

export async function getAllEverydaySlugs() {
  const slugs: string[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${API_URL}/everyday?per_page=100&page=${page}&_fields=slug`
    );
    const posts = await res.json();
    slugs.push(...posts.map((p: { slug: string }) => p.slug));
    hasMore = posts.length === 100;
    page++;
  }

  return slugs;
}

export async function getWorkPosts() {
  const res = await fetch(`${API_URL}/work?per_page=100`);

  if (!res.ok) throw new Error('Failed to fetch work posts');

  return res.json();
}

export async function getWorkBySlug(slug: string) {
  const res = await fetch(`${API_URL}/work?slug=${slug}`);

  if (!res.ok) return null;

  const posts = await res.json();
  return posts[0] || null;
}

export async function getMediumTerms() {
  const res = await fetch(`${API_URL}/medium?per_page=100`);

  if (!res.ok) return [];

  return res.json();
}
```

---

## Phase 3: Base Layout

### 3.1 Base Layout

```astro
---
// src/layouts/Base.astro
interface Props {
  title: string;
  description?: string;
}

const { title, description = '29th Floor' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />
  <title>{title} | 29th Floor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet" />
</head>
<body class="bg-teal-950 text-teal-500 font-mono min-h-screen">
  <header class="p-4">
    <nav class="flex items-center justify-between">
      <a href="/" class="text-white text-2xl font-bold">29F_</a>
      <ul class="flex gap-4">
        <li><a href="/everyday" class="hover:text-yellow-500">Everyday</a></li>
        <li><a href="/work" class="hover:text-yellow-500">Work</a></li>
        <li><a href="/blog" class="hover:text-yellow-500">Blog</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <slot />
  </main>

  <footer class="p-4 text-center text-teal-700">
    <p>&copy; {new Date().getFullYear()} 29th Floor</p>
  </footer>
</body>
</html>
```

---

## Phase 4: Static Generation (Hybrid Approach)

### 4.1 How Astro Handles This

Astro uses `output: 'hybrid'` mode:
- Pages are **static by default** (built at deploy time)
- Add `export const prerender = false` to make a page SSR

### 4.2 Everyday Archive (Static)

```astro
---
// src/pages/everyday/index.astro
import Base from '../../layouts/Base.astro';
import EverydayGrid from '../../components/EverydayGrid.astro';
import { getEverydayPosts } from '../../lib/api';

const { posts } = await getEverydayPosts(1, 50);
---

<Base title="Everyday">
  <section class="p-4">
    <h1 class="text-yellow-500 text-4xl mb-8">Everyday</h1>
    <EverydayGrid posts={posts} />
  </section>
</Base>
```

### 4.3 Single Everyday Post (Static with Dynamic Fallback)

```astro
---
// src/pages/everyday/[slug].astro
import Base from '../../layouts/Base.astro';
import { getEverydayBySlug, getAllEverydaySlugs } from '../../lib/api';

// Pre-build recent 100 posts at deploy time
export async function getStaticPaths() {
  const slugs = await getAllEverydaySlugs();

  // Only pre-build recent 100
  return slugs.slice(0, 100).map(slug => ({
    params: { slug }
  }));
}

const { slug } = Astro.params;
const post = await getEverydayBySlug(slug);

if (!post) {
  return Astro.redirect('/404');
}

const { toolset_fields } = post;
---

<Base title={post.title.rendered}>
  <article class="max-w-4xl mx-auto p-4">
    <header class="mb-8">
      <h1 class="text-yellow-500 text-4xl mb-2">{post.title.rendered}</h1>
      <time class="text-teal-600">
        {new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
    </header>

    <div class="border border-teal-800 p-6">
      {toolset_fields.embed && (
        <div class="aspect-video" set:html={toolset_fields.embed} />
      )}

      {toolset_fields.audio && !toolset_fields.embed && (
        <div set:html={toolset_fields.audio} />
      )}

      {toolset_fields.image && !toolset_fields.embed && !toolset_fields.audio && (
        <img
          src={toolset_fields.image}
          alt={post.title.rendered}
          class="max-w-full"
        />
      )}
    </div>

    <div class="mt-8 prose prose-invert" set:html={post.content.rendered} />
  </article>
</Base>

<!-- Load Web Component for GIF hover if needed -->
<script src="/js/components/gif-hover.js" type="module"></script>
```

---

## Phase 5: Components

### 5.1 Everyday Grid (Astro Component)

```astro
---
// src/components/EverydayGrid.astro
import EverydayCard from './EverydayCard.astro';
import type { EverydayPost } from '../lib/api';

interface Props {
  posts: EverydayPost[];
}

const { posts } = Astro.props;
---

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
  {posts.map((post, index) => (
    <EverydayCard post={post} featured={index === 0} />
  ))}
</div>
```

### 5.2 Everyday Card (Astro Component)

```astro
---
// src/components/EverydayCard.astro
import type { EverydayPost } from '../lib/api';

interface Props {
  post: EverydayPost;
  featured?: boolean;
}

const { post, featured = false } = Astro.props;
const { toolset_fields } = post;

const mediaType = toolset_fields.embed
  ? 'embed'
  : toolset_fields.audio
  ? 'audio'
  : 'image';

const isGif = toolset_fields.image?.endsWith('.gif');
---

<a
  href={`/everyday/${post.slug}`}
  class:list={[
    'relative block border border-teal-800 hover:border-teal-500',
    'hover:shadow-[inset_0_0_16px_theme(colors.teal.500)]',
    'transition-all',
    { 'col-span-2 row-span-2': featured }
  ]}
>
  {isGif ? (
    <gif-hover
      data-static={toolset_fields.image_thumbnail}
      data-animated={toolset_fields.image}
    >
      <img
        src={toolset_fields.image_thumbnail}
        alt={post.title.rendered}
        class="w-full"
      />
    </gif-hover>
  ) : (
    <img
      src={toolset_fields.image_thumbnail}
      alt={post.title.rendered}
      class="w-full"
    />
  )}

  <div class="absolute top-0 right-0 bg-black/75 text-xs p-1 text-right">
    <span class="text-yellow-500">{post.title.rendered}</span>
    <div class="text-teal-600">
      {new Date(post.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}
    </div>
  </div>

  {mediaType !== 'image' && (
    <div class="absolute bottom-0 right-0 bg-black/75 text-xs p-1 uppercase text-teal-500">
      {mediaType === 'embed' ? 'Video' : 'Audio'}
    </div>
  )}
</a>

<script src="/js/components/gif-hover.js" type="module"></script>
```

---

## Phase 6: Web Components

### 6.1 GIF Hover Component

```javascript
// public/js/components/gif-hover.js

class GifHover extends HTMLElement {
  connectedCallback() {
    const staticSrc = this.dataset.static;
    const animatedSrc = this.dataset.animated;
    const img = this.querySelector('img');

    if (!img || !staticSrc || !animatedSrc) return;

    this.addEventListener('mouseenter', () => {
      img.src = animatedSrc;
    });

    this.addEventListener('mouseleave', () => {
      img.src = staticSrc;
    });
  }
}

customElements.define('gif-hover', GifHover);
```

### 6.2 Media Player Component (for audio)

```javascript
// public/js/components/media-player.js

class MediaPlayer extends HTMLElement {
  connectedCallback() {
    const audio = this.querySelector('audio');
    if (!audio) return;

    this.innerHTML = `
      <div class="flex items-center gap-4 p-4 bg-teal-900 border border-teal-700">
        <button class="play-btn text-yellow-500 text-2xl">▶</button>
        <div class="flex-1">
          <div class="progress-bar h-2 bg-teal-800 cursor-pointer">
            <div class="progress h-full bg-yellow-500 w-0"></div>
          </div>
        </div>
        <span class="time text-teal-500 text-sm">0:00</span>
      </div>
    `;

    this.appendChild(audio);
    audio.style.display = 'none';

    const playBtn = this.querySelector('.play-btn');
    const progress = this.querySelector('.progress');
    const progressBar = this.querySelector('.progress-bar');
    const time = this.querySelector('.time');

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸';
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });

    audio.addEventListener('timeupdate', () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      progress.style.width = `${pct}%`;

      const mins = Math.floor(audio.currentTime / 60);
      const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      time.textContent = `${mins}:${secs}`;
    });

    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }
}

customElements.define('media-player', MediaPlayer);
```

---

## Phase 7: Deployment

### 7.1 Connect to Vercel

1. Push repo to GitHub: `github.com/29thfloor/29thfloor-astro`
2. Log into Vercel, import the repository
3. Vercel auto-detects Astro
4. Add environment variable:
   - `WORDPRESS_API_URL` = `https://29thfloor.com/wp-json/wp/v2`
5. Deploy

### 7.2 Domain Configuration

1. Deploy to Vercel, get preview URL (e.g., `29thfloor-astro.vercel.app`)
2. Test thoroughly on preview URL
3. When ready, add custom domain in Vercel settings
4. Update DNS to point `29thfloor.com` to Vercel
5. WordPress moves to `wp.29thfloor.com` (or stays hidden, API-only)

### 7.3 On-Demand Revalidation

For Astro in hybrid mode, you can trigger rebuilds via Vercel's deploy hooks:

1. In Vercel: Settings → Git → Deploy Hooks
2. Create hook, get URL
3. In WordPress, trigger on post save:

```php
// functions.php

function _29f__trigger_vercel_rebuild( $post_id ) {
    $post_type = get_post_type( $post_id );

    if ( ! in_array( $post_type, array( 'everyday', 'work' ), true ) ) {
        return;
    }

    wp_remote_post( VERCEL_DEPLOY_HOOK_URL );
}
add_action( 'save_post', '_29f__trigger_vercel_rebuild' );
```

---

## Phase 8: Future Features (Post-Launch)

| Feature | Implementation |
|---------|----------------|
| Search | Web Component + API endpoint |
| Filter by Medium | Query params + filtered fetch |
| Dark/Light Mode | Web Component + CSS custom properties |
| Pagination | Astro component + page params |
| Comments | Supabase or external service |

---

## Implementation Checklist

- [ ] Create GitHub repo `29thfloor/29thfloor-astro`
- [ ] Initialize Astro project
- [ ] Add Tailwind integration
- [ ] Set up Tailwind config with color palette
- [ ] Create API client (`src/lib/api.ts`)
- [ ] Create Base layout
- [ ] Build Everyday archive page with grid
- [ ] Build single Everyday page
- [ ] Create GIF hover Web Component
- [ ] Build Work archive page
- [ ] Build single Work page
- [ ] Build homepage
- [ ] Connect to Vercel
- [ ] Test on preview URL
- [ ] Configure custom domain
- [ ] Set up deploy hook in WordPress

---

## Astro vs Next.js Quick Reference

| Concept | Next.js | Astro |
|---------|---------|-------|
| Pages | `app/page.tsx` | `pages/index.astro` |
| Dynamic routes | `[slug]/page.tsx` | `[slug].astro` |
| Layout | `layout.tsx` | `layouts/Base.astro` |
| Static paths | `generateStaticParams()` | `getStaticPaths()` |
| Server data | async component | frontmatter (`---`) |
| Interactivity | React components | Web Components |
| Styling | CSS Modules / Tailwind | Scoped styles / Tailwind |

---

## Next Steps

Ready to start? First task:

1. Create the GitHub repo
2. Initialize the Astro project
3. Test API connection
