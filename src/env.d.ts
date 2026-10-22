declare module 'photoswipe-video-plugin/dist/photoswipe-video-plugin.esm.js' {
  import type PhotoSwipeLightbox from 'photoswipe/lightbox';

  export default class PhotoSwipeVideoPlugin {
    constructor(lightbox: PhotoSwipeLightbox, options?: Record<string, unknown>);
  }
}
