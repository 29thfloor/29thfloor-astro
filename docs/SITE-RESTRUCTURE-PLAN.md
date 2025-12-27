# Site Restructure Plan

## Current State

- **/everyday** - 1,890 posts (2014-2025), daily creative work
- **/work** - Portfolio projects
- **/blog** - Written posts

---

## Proposed Changes

### 1. Everydays → Finished Project

Move the everyday archive from a top-level section to a project.

**Options:**

A) **Single project page with embedded archive**
   - `/work/everydays-2014-2025` shows intro + grid of all posts
   - Individual posts at `/work/everydays-2014-2025/[slug]`
   - Pros: Clean, treats it as one body of work
   - Cons: Longer URLs, more routing complexity

B) **Project page that links to separate archive**
   - `/work/everydays-2014-2025` shows intro + link to archive
   - Archive stays at `/everyday` or moves to `/archive/everyday`
   - Pros: Simpler, less migration
   - Cons: Feels disconnected

C) **Keep current structure, just rename in nav**
   - Change nav from "Everyday" to "Everydays (2014-2025)"
   - Add note that it's a completed project
   - Pros: No code changes
   - Cons: Doesn't feel like a "project"

**Preferred option:** _____________

---

### 2. New Creative Posts Section

A place to post new creative work without the "everyday" commitment.

**What to call it:**
- [ ] Lab
- [ ] Experiments
- [ ] Sketches
- [ ] Output
- [ ] Stream
- [ ] Other: _____________

**Content types to support:**
- [ ] Images (static)
- [ ] GIFs / animations
- [ ] Videos (embedded)
- [ ] Audio
- [ ] Written pieces
- [ ] Mixed/other

**Post frequency:**
- [ ] Whenever inspiration strikes
- [ ] Weekly-ish
- [ ] Monthly-ish

**Display format:**
- [ ] Grid (like everyday)
- [ ] Feed/stream (like blog)
- [ ] Mixed (images in grid, writing in list)
- [ ] Other: _____________

---

### 3. WordPress Backend

**Options for new content:**

A) **New custom post type**
   - Create `output` or `lab` post type
   - Fresh start, separate from everyday
   - Requires Toolset/ACF changes

B) **Repurpose existing**
   - Use regular posts with a category
   - Or continue using `everyday` post type but rename it
   - Less work, but messier

C) **No WordPress changes**
   - Just restructure the Astro frontend
   - Everyday stays as-is in WP, displayed differently

**Preferred option:** _____________

---

### 4. Navigation Structure

**Current:**
```
Home | Everyday | Work | Blog
```

**Option A - Minimal change:**
```
Home | Everydays (2014-2025) | Work | Blog | [New Section]
```

**Option B - Projects-focused:**
```
Home | Projects | Blog
         ├── Everydays 2014-2025
         ├── [Client Work]
         └── [New Creative Posts]
```

**Option C - Split personal/client:**
```
Home | Work | Lab | Blog
        │      └── New creative posts
        └── Client/commercial projects + Everydays archive
```

**Preferred option:** _____________

---

## Questions to Answer

1. Is "everyday" content meaningfully different from "work" content, or just frequency?

2. Should the new section feel casual (stream/lab) or polished (portfolio)?

3. Do you want to categorize/tag new posts, or keep it simple?

4. Should old everyday posts be migrated to the new system, or stay separate?

5. Any features the new section needs that everyday doesn't have?
   - Comments?
   - Likes/reactions?
   - RSS feed?
   - Email subscription?

---

## Next Steps

1. [ ] Answer questions above
2. [ ] Choose preferred options
3. [ ] Sketch out new nav/structure
4. [ ] Decide if WordPress changes needed
5. [ ] Implement in Astro
