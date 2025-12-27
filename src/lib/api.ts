/**
 * WordPress REST API Client
 *
 * This module handles all communication with the WordPress backend.
 * It fetches posts, custom post types, and taxonomies.
 */

const API_URL = import.meta.env.WORDPRESS_API_URL;

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Everyday Post
 *
 * Custom post type for daily creative work.
 * Has custom Toolset fields for image, audio, and embed content.
 */
export interface EverydayPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  medium: number[]; // Taxonomy term IDs
  toolset_fields: {
    image: string;           // Full-size image URL
    image_thumbnail: string; // Thumbnail URL
    audio: string;           // Audio embed HTML
    embed: string;           // Video embed HTML
  };
}

/**
 * Work Post
 *
 * Custom post type for portfolio/project items.
 * Has a repeatable image field.
 */
export interface WorkPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media: number;
  toolset_fields: {
    work_images: string[]; // Array of image URLs
  };
}

/**
 * Medium Term
 *
 * Taxonomy for categorizing everyday posts by tool/medium used.
 * Examples: "Photoshop", "After Effects", "Cinema 4D"
 */
export interface MediumTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}

/**
 * Paginated Response
 *
 * WordPress REST API returns pagination info in headers.
 * This interface wraps the response with that metadata.
 */
export interface PaginatedResponse<T> {
  posts: T[];
  total: number;
  totalPages: number;
}

// =============================================================================
// Everyday Posts
// =============================================================================

/**
 * Get paginated everyday posts
 *
 * @param page - Page number (1-indexed)
 * @param perPage - Number of posts per page (max 100)
 * @returns Posts with pagination metadata
 */
export async function getEverydayPosts(
  page = 1,
  perPage = 50
): Promise<PaginatedResponse<EverydayPost>> {
  const res = await fetch(
    `${API_URL}/everyday?per_page=${perPage}&page=${page}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch everyday posts: ${res.status}`);
  }

  const posts = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '0');

  return { posts, total, totalPages };
}

/**
 * Get a single everyday post by slug
 *
 * @param slug - The post slug (URL-friendly name)
 * @returns The post or null if not found
 */
export async function getEverydayBySlug(
  slug: string
): Promise<EverydayPost | null> {
  // Encode the slug for the API request
  const encodedSlug = encodeURIComponent(slug);
  const res = await fetch(`${API_URL}/everyday?slug=${encodedSlug}`);

  if (!res.ok) return null;

  const posts = await res.json();
  return posts[0] || null;
}

/**
 * Get all everyday post slugs
 *
 * Used for static site generation to know which pages to build.
 * Fetches in batches of 100 to handle large archives.
 *
 * @returns Array of all slugs
 */
export async function getAllEverydaySlugs(): Promise<string[]> {
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

/**
 * Minimal post info for navigation
 */
export interface PostNavInfo {
  slug: string;
  title: string;
}

/**
 * Get all everyday posts with minimal fields for navigation
 *
 * Returns posts ordered by date (newest first) with just slug and title.
 * Used to build prev/next links during static generation.
 *
 * @returns Array of post nav info
 */
export async function getAllEverydayNavInfo(): Promise<PostNavInfo[]> {
  const posts: PostNavInfo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${API_URL}/everyday?per_page=100&page=${page}&_fields=slug,title&orderby=date&order=desc`
    );
    const batch = await res.json();
    posts.push(...batch.map((p: { slug: string; title: { rendered: string } }) => ({
      // Decode slug - WordPress returns URL-encoded slugs, but Astro handles encoding
      slug: decodeURIComponent(p.slug),
      title: p.title.rendered.replace(/<[^>]*>/g, ''),
    })));
    hasMore = batch.length === 100;
    page++;
  }

  return posts;
}

// =============================================================================
// Blog Posts (standard WordPress posts)
// =============================================================================

/**
 * Blog Post
 */
export interface BlogPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media: number;
  categories: number[];
}

/**
 * Get paginated blog posts
 */
export async function getBlogPosts(
  page = 1,
  perPage = 10
): Promise<PaginatedResponse<BlogPost>> {
  const res = await fetch(
    `${API_URL}/posts?per_page=${perPage}&page=${page}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch blog posts: ${res.status}`);
  }

  const posts = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '0');

  return { posts, total, totalPages };
}

/**
 * Get a single blog post by slug
 */
export async function getBlogBySlug(
  slug: string
): Promise<BlogPost | null> {
  const encodedSlug = encodeURIComponent(slug);
  const res = await fetch(`${API_URL}/posts?slug=${encodedSlug}`);

  if (!res.ok) return null;

  const posts = await res.json();
  return posts[0] || null;
}

/**
 * Get all blog post slugs for static generation
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${API_URL}/posts?per_page=100&page=${page}&_fields=slug`
    );
    const posts = await res.json();
    slugs.push(...posts.map((p: { slug: string }) => decodeURIComponent(p.slug)));
    hasMore = posts.length === 100;
    page++;
  }

  return slugs;
}

/**
 * Get featured image URL by media ID
 */
export async function getMediaUrl(mediaId: number): Promise<string | null> {
  if (!mediaId) return null;

  const res = await fetch(`${API_URL}/media/${mediaId}?_fields=source_url`);
  if (!res.ok) return null;

  const media = await res.json();
  return media.source_url || null;
}

// =============================================================================
// Work Posts
// =============================================================================

/**
 * Get all work posts
 *
 * Work archive is smaller, so we fetch all at once.
 *
 * @returns Array of all work posts
 */
export async function getWorkPosts(): Promise<WorkPost[]> {
  const res = await fetch(`${API_URL}/work?per_page=100`);

  if (!res.ok) {
    throw new Error(`Failed to fetch work posts: ${res.status}`);
  }

  return res.json();
}

/**
 * Get a single work post by slug
 *
 * @param slug - The post slug
 * @returns The post or null if not found
 */
export async function getWorkBySlug(
  slug: string
): Promise<WorkPost | null> {
  const res = await fetch(`${API_URL}/work?slug=${slug}`);

  if (!res.ok) return null;

  const posts = await res.json();
  return posts[0] || null;
}

// =============================================================================
// Taxonomies
// =============================================================================

/**
 * Get all medium terms
 *
 * Used for filtering everyday posts by tool/medium.
 *
 * @returns Array of all medium terms
 */
export async function getMediumTerms(): Promise<MediumTerm[]> {
  const res = await fetch(`${API_URL}/medium?per_page=100`);

  if (!res.ok) return [];

  return res.json();
}
