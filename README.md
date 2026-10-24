# Oren Zilbershtein — website

A fast, photo-first portfolio site: a home page (hero, stats, work by place,
about, services, testimonials, contact) and a gallery page for every place
consulted, with photos and videos. Built with [Astro](https://astro.build);
photos are optimized automatically.

## Preview it

```bash
npm install      # first time only
npm run dev      # then open http://localhost:4321
```

## Where everything lives

| What | File |
| --- | --- |
| Name, bio, services, contact details | `src/config.ts` |
| Places + their photos | `src/content/places/<place>/` (one folder each) |
| Testimonials | `src/content/testimonials.yaml` |
| Main photos | `src/assets/chef/hero.jpg` (top of the page) and `about.jpg` (About section) |
| Logo & link-preview image | `src/assets/brand/signature.png` and `share.jpg` |
| Colors & fonts | `src/styles/global.css` (top of the file) |

Anything marked ✏️ is a placeholder waiting for the real details.

## Adding a place and its photos

1. Put the photos and videos in `new-photos/<Place name>/` (one folder per place, English
   letters). Add the business's logo too, named `logo.png` (or `.jpg`).
2. Run `npm run add-photos`.
   Photos are turned upright, resized for the web, converted from iPhone HEIC,
   and stripped of GPS location data. Videos get a cover frame for the gallery, and
   iPhone `.mov` videos are converted to `.mp4`. A starter `index.md` is created for
   new places.
3. Fill in `src/content/places/<place>/index.md`: city, country, year, type, a short
   summary, and what was done there. Text below the `---` line becomes the story on
   the place's page.

Gallery order follows file names (prefix them `01-`, `02-`… to choose). The first photo
is used on the card unless you set `cover:` (or name a photo `cover.jpg`). Captions are
optional (`captions:` in `index.md`) and double as descriptions for screen readers.

## Adding a testimonial

Copy a block in `src/content/testimonials.yaml` and edit it. Add `place:` with a place's
folder name to also show the quote on that place's page.

## Publishing

The site is live at **https://ozculinary.com**, hosted free on GitHub Pages.
Every push to `main` rebuilds and publishes it automatically (see the
"Actions" tab on GitHub; it takes a couple of minutes).

The domain is registered at Namecheap. Its DNS points to GitHub Pages:
four `A` records for `@` (185.199.108.153, 185.199.109.153, 185.199.110.153,
185.199.111.153) and a `CNAME` for `www` → `yuvalzilbershtein.github.io`.
