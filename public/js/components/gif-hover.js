/**
 * GIF Hover Web Component
 *
 * Swaps between a static thumbnail and animated GIF on hover.
 * This keeps the page fast (thumbnails load quickly) while still
 * allowing users to preview animations.
 *
 * Usage:
 *   <gif-hover data-static="/thumb.jpg" data-animated="/full.gif">
 *     <img src="/thumb.jpg" alt="..." />
 *   </gif-hover>
 *
 * How it works:
 * 1. On mouseenter: swap img src to the animated GIF
 * 2. On mouseleave: swap back to the static thumbnail
 *
 * The `data-*` attributes are accessed via `this.dataset` in JavaScript.
 */

class GifHover extends HTMLElement {
  /**
   * connectedCallback is called when the element is added to the DOM.
   * This is where we set up event listeners.
   */
  connectedCallback() {
    // Get the URLs from data attributes
    const staticSrc = this.dataset.static;
    const animatedSrc = this.dataset.animated;

    // Find the img element inside this component
    const img = this.querySelector('img');

    // If we're missing any required pieces, bail out
    if (!img || !staticSrc || !animatedSrc) {
      return;
    }

    // Preload the animated GIF so it's ready when user hovers
    // This happens in the background and doesn't block the page
    const preloadImage = new Image();
    preloadImage.src = animatedSrc;

    // Swap to animated on mouse enter
    this.addEventListener('mouseenter', () => {
      img.src = animatedSrc;
    });

    // Swap back to static on mouse leave
    this.addEventListener('mouseleave', () => {
      img.src = staticSrc;
    });
  }
}

// Register the custom element
// After this, <gif-hover> becomes a valid HTML tag
customElements.define('gif-hover', GifHover);
