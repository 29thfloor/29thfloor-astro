# Server-Side Rendering (SSR) vs Static Site Generation (SSG)

## The Problem

You have 1,800+ everyday posts. With **Static Site Generation (SSG)**, Astro builds every single page at deploy time:

```
Building page 1 of 1890...
Building page 2 of 1890...
Building page 3 of 1890...
... (20+ minutes later)
Building page 1890 of 1890...
```

This means:
- **Slow deploys**: Every deploy rebuilds all 1,800+ pages
- **Timeout risk**: Vercel has build time limits (45 min on free tier)
- **Wasted resources**: Most of those pages may never be visited

---

## The Solution: On-Demand Rendering

Instead of pre-building everything, pages are **generated when someone visits them**.

### How It Works

```
User visits /everyday/some-post
        ↓
Does the page exist in cache?
        ↓
   NO → Generate the page
        → Save to cache
        → Serve to user
        ↓
   YES → Serve cached version
```

First visit: ~500ms (page is generated)
Subsequent visits: ~50ms (served from cache)

---

## Rendering Strategies Compared

| Strategy | When Pages Build | Best For |
|----------|------------------|----------|
| **SSG** (Static) | At deploy time | Small sites, content that rarely changes |
| **SSR** (Server) | On every request | Dynamic content, personalization |
| **ISR** (Incremental Static) | First request, then cached | Large archives, blogs |

### SSG (What we have now)
```
Deploy → Build ALL pages → Serve static files
```
- ✅ Fastest page loads (everything pre-built)
- ❌ Slow deploys with lots of content
- ❌ Must redeploy to update any content

### SSR (Server-Side Rendering)
```
Request → Generate page → Serve (no caching)
```
- ✅ Always fresh content
- ✅ Fast deploys
- ❌ Slower page loads (generates every time)
- ❌ More server load

### ISR / On-Demand (Recommended for you)
```
Request → Generate once → Cache → Serve cached version
```
- ✅ Fast deploys (nothing pre-built)
- ✅ Fast page loads after first visit (cached)
- ✅ Can set cache duration (revalidate every X seconds)
- ⚠️ First visitor waits for generation

---

## How Astro Handles This

Astro is **static by default** but supports **hybrid rendering**:

```astro
---
// This page will be server-rendered (not pre-built)
export const prerender = false;
---
```

Or at the config level:

```js
// astro.config.mjs
export default defineConfig({
  output: 'hybrid', // Most pages static, some on-demand
  adapter: vercel(),
});
```

### Page-Level Control

```astro
// src/pages/everyday/[slug].astro
---
// Don't pre-build this page, render on-demand
export const prerender = false;

const { slug } = Astro.params;
const post = await getEverydayBySlug(slug);
---
```

---

## Recommended Setup for 29thfloor-astro

| Section | Strategy | Why |
|---------|----------|-----|
| Home page | Static (SSG) | Single page, rarely changes |
| /everyday archive | Static (SSG) | Pagination pages are finite |
| /everyday/[slug] | **On-demand** | 1,800+ posts, build on first request |
| /work | Static (SSG) | Small number of pages |
| /work/[slug] | Static (SSG) | Small number of pages |
| /blog | Static (SSG) | Small number of pages |
| /blog/[slug] | Static (SSG) | Small number of pages |

This gives you:
- **Fast deploys**: Only build ~50 pages instead of 1,800+
- **Fast page loads**: Popular everyday posts get cached
- **Fresh content**: New posts work immediately without redeploy

---

## Cache Control

With Vercel, you can control how long pages stay cached:

```astro
---
// Revalidate this page every hour
Astro.response.headers.set('CDN-Cache-Control', 'public, max-age=3600');
---
```

Or use Vercel's ISR:
- First request: Generate and cache
- Within cache period: Serve cached version
- After cache expires: Regenerate in background

---

## Trade-offs to Consider

### Static (Current)
- First-time visitors get instant loads
- Deploys are slow
- Need to redeploy for content changes

### On-Demand (Recommended)
- First-time visitors wait ~500ms for generation
- Deploys are fast
- New content works immediately
- Cached pages are just as fast as static

---

## Summary

For a site with 1,800+ posts:

**Don't**: Pre-build everything at deploy time (slow, might timeout)

**Do**: Build on-demand and cache (fast deploys, pages generated as needed)

The slight delay on first visit is worth the massive improvement in deploy times and flexibility.
