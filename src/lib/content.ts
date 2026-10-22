import type { ImageMetadata } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';

type ImageModule = { default: ImageMetadata };

// Everything inside a place folder is found automatically — no list to maintain.
const placeImageModules = import.meta.glob<ImageModule>(
  '/src/content/places/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

const placeVideoUrls = import.meta.glob<string>('/src/content/places/*/*.{mp4,webm,MP4,WEBM}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const chefPhotoModules = import.meta.glob<ImageModule>(
  '/src/assets/chef/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

/** A photo, or a video shown with its cover frame (`src`). */
export interface MediaItem {
  src: ImageMetadata;
  file: string;
  alt: string;
  caption?: string;
  video?: string;
}

export interface Place {
  slug: string;
  entry: CollectionEntry<'places'>;
  data: CollectionEntry<'places'>['data'];
  media: MediaItem[];
  cover?: MediaItem;
  logo?: ImageMetadata;
}

const byFileName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

const baseName = (file: string) => file.replace(/\.[^.]+$/, '').toLowerCase();

interface FolderFiles {
  items: { file: string; src: ImageMetadata; video?: string }[];
  logo?: ImageMetadata;
}

function filesByFolder() {
  const folders = new Map<string, FolderFiles>();
  const folder = (path: string) => {
    const name = path.split('/').at(-2)!;
    if (!folders.has(name)) folders.set(name, { items: [] });
    return folders.get(name)!;
  };
  const fileName = (path: string) => path.split('/').at(-1)!;

  const posters = new Map<string, ImageMetadata>();
  for (const [path, mod] of Object.entries(placeImageModules)) {
    const file = fileName(path);
    if (/\.poster\.[^.]+$/i.test(file)) posters.set(path.replace(/\.poster\.[^.]+$/i, ''), mod.default);
    else if (baseName(file) === 'logo') folder(path).logo = mod.default;
    else folder(path).items.push({ file, src: mod.default });
  }

  for (const [path, url] of Object.entries(placeVideoUrls)) {
    const poster = posters.get(path.replace(/\.[^.]+$/, ''));
    if (!poster) {
      console.warn(`[site] Skipping ${path}: it needs a cover image named <video>.poster.jpg`);
      continue;
    }
    folder(path).items.push({ file: fileName(path), src: poster, video: url });
  }

  for (const { items } of folders.values()) items.sort((a, b) => byFileName(a.file, b.file));
  return folders;
}

let placesCache: Place[] | undefined;

export async function getPlaces(): Promise<Place[]> {
  if (placesCache) return placesCache;
  const folders = filesByFolder();
  const entries = await getCollection('places');

  placesCache = entries
    .map((entry) => {
      const { data } = entry;
      const files = folders.get(entry.filePath?.split('/').at(-2) ?? entry.id);
      const where = data.city ? `, ${data.city}` : '';
      const media: MediaItem[] = (files?.items ?? []).map(({ file, src, video }, i) => ({
        src,
        file,
        video,
        caption: data.captions[file],
        alt: data.captions[file] ?? `${data.name}${where} — ${video ? 'video' : 'photo'} ${i + 1}`,
      }));
      const photos = media.filter((m) => !m.video);
      const cover =
        photos.find((p) => data.cover && p.file.toLowerCase() === data.cover.toLowerCase()) ??
        photos.find((p) => baseName(p.file) === 'cover') ??
        photos[0] ??
        media[0];
      return { slug: entry.id, entry, data, media, cover, logo: files?.logo };
    })
    .sort(
      (a, b) =>
        (a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
        String(b.data.year ?? '').localeCompare(String(a.data.year ?? '')) ||
        a.data.name.localeCompare(b.data.name),
    );
  return placesCache;
}

/** "8 photos · 1 video" */
export function mediaCount(media: MediaItem[]) {
  const videos = media.filter((m) => m.video).length;
  const photos = media.length - videos;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  return [photos && plural(photos, 'photo'), videos && plural(videos, 'video')].filter(Boolean).join(' · ');
}

export async function getTestimonials() {
  const items = await getCollection('testimonials');
  // Keep the order they appear in testimonials.yaml.
  return items.sort((a, b) => byFileName(a.id, b.id)).map((t) => t.data);
}

type Testimonial = Awaited<ReturnType<typeof getTestimonials>>[number];

/** Who said it: the person if named, otherwise the business. */
export function attribution(t: Testimonial) {
  const who = t.name ?? t.business ?? '';
  const details = [t.name ? [t.role, t.business].filter(Boolean).join(', ') : t.role, t.location].filter(
    Boolean,
  ) as string[];
  return { who, details };
}

/** Photos of the chef in src/assets/chef — e.g. hero.jpg, about.jpg */
export function getChefPhoto(name: string): ImageMetadata | undefined {
  const match = Object.entries(chefPhotoModules).find(
    ([path]) => baseName(path.split('/').at(-1)!) === name,
  );
  return match?.[1].default;
}

export function placeLocation(data: Place['data']) {
  return [data.city, data.country].filter(Boolean).join(', ');
}
