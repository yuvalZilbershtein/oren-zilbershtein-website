// Imports photos and videos from new-photos/ into the site.
//
//   new-photos/<Place name>/   → src/content/places/<place-name>/  (+ a starter index.md)
//   new-photos/chef/           → src/assets/chef/  (name them hero.jpg and about.jpg)
//
// Photos are turned upright, shrunk to a web-friendly size (max 2400px), saved as
// JPEG and stripped of hidden data such as GPS location; iPhone HEIC photos are
// converted on macOS. A file named "logo" becomes the place's logo (kept as PNG).
// Videos get a cover frame for the gallery; on macOS their location data is removed
// and iPhone .mov videos are converted to .mp4 so every browser can play them.
// Files already imported are skipped unless the original changed since;
// chef photos always replace the old ones.

import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = path.join(ROOT, 'new-photos');
const PLACES = path.join(ROOT, 'src/content/places');
const CHEF = path.join(ROOT, 'src/assets/chef');
const MAX_SIZE = 2400;
const PHOTO_TYPES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.heic', '.heif']);
const VIDEO_TYPES = new Set(['.mp4', '.m4v', '.mov', '.webm']);
const isMac = process.platform === 'darwin';

const slugify = (text) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isUpToDate = (target, source) =>
  existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs;

const starterPage = (name) => `---
name: "${name.replace(/"/g, '\\"')}"
city: ""            # ✏️ e.g. Tel Aviv
country: ""         # ✏️ e.g. Israel
year:               # ✏️ e.g. 2024 (or remove this line)
type: ""            # ✏️ Hotel, Bakery, Café, Restaurant…
summary: ""         # ✏️ One or two sentences about the project
services:           # ✏️ What was done there, one per line, e.g.
#  - Dessert menu development
#  - Team training
# cover: photo.jpg  # optional: which photo to show on the card (default: first photo)
# order: 1          # optional: lower numbers are shown first
# captions:         # optional: captions shown when a photo is opened
#   photo.jpg: "Name of the dessert"
---

Write the story of the project here (optional).
`;

async function importPhoto(source, destDir, base, replace) {
  const ext = path.extname(source).toLowerCase();
  const isLogo = base === 'logo';
  const target = path.join(destDir, isLogo ? 'logo.png' : `${base}.jpg`);
  if (!replace && isUpToDate(target, source)) return 'skipped';

  let input = source;
  let temp;
  if (ext === '.heic' || ext === '.heif') {
    if (!isMac) {
      console.warn(`  ! ${path.basename(source)}: HEIC photos can only be converted on a Mac. Export it as JPEG first.`);
      return 'failed';
    }
    temp = path.join(os.tmpdir(), `add-photos-${process.pid}-${base}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', source, '--out', temp], { stdio: 'ignore' });
    input = temp;
  }

  try {
    const size = isLogo ? 800 : MAX_SIZE;
    const image = sharp(input).rotate().resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true });
    // Logos keep their transparent background; photos become JPEG.
    await (isLogo ? image.png() : image.flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true })).toFile(target);
    return 'added';
  } catch (error) {
    console.warn(`  ! ${path.basename(source)}: could not be read (${error.message})`);
    return 'failed';
  } finally {
    if (temp) await rm(temp, { force: true });
  }
}

async function makePoster(video, poster) {
  if (!isMac) return false;
  const frame = path.join(os.tmpdir(), `add-photos-${process.pid}-frame.jpg`);
  const thumb = path.join(os.tmpdir(), `${path.basename(video)}.png`);
  try {
    try {
      execFileSync('swift', [path.join(ROOT, 'scripts/video-frame.swift'), video, frame], { stdio: 'ignore' });
    } catch {
      // No Swift toolchain: fall back to the Quick Look thumbnail.
      execFileSync('qlmanage', ['-t', '-s', '1600', '-o', os.tmpdir(), video], { stdio: 'ignore' });
      await copyFile(thumb, frame);
    }
    await sharp(frame).jpeg({ quality: 85, mozjpeg: true }).toFile(poster);
    return true;
  } catch {
    return false;
  } finally {
    await rm(frame, { force: true });
    await rm(thumb, { force: true });
  }
}

async function importVideo(source, destDir, base) {
  const ext = path.extname(source).toLowerCase();
  const target = path.join(destDir, `${base}${ext === '.webm' ? '.webm' : '.mp4'}`);
  const poster = path.join(destDir, `${base}.poster.jpg`);
  if (isUpToDate(target, source) && existsSync(poster)) return 'skipped';

  try {
    if (isMac && ext !== '.webm') {
      // Passthrough keeps the original quality and drops location data;
      // .mov (iPhone) is re-encoded to H.264, which every browser plays.
      const preset = ext === '.mov' ? 'Preset1280x720' : 'PresetPassthrough';
      execFileSync('avconvert', ['--source', source, '--output', target, '--preset', preset, '--replace'], { stdio: 'ignore' });
    } else if (ext === '.mov') {
      console.warn(`  ! ${path.basename(source)}: .mov videos can only be converted on a Mac. Export it as MP4 first.`);
      return 'failed';
    } else {
      await copyFile(source, target);
    }
  } catch (error) {
    console.warn(`  ! ${path.basename(source)}: could not be converted (${error.message})`);
    return 'failed';
  }

  if (!(await makePoster(target, poster))) {
    console.warn(`  ! ${path.basename(source)}: add a cover image named ${base}.poster.jpg next to the video.`);
  }
  return 'added';
}

async function importFolder(sourceDir, destDir, isChef) {
  await mkdir(destDir, { recursive: true });
  const files = (await readdir(sourceDir))
    .filter((f) => !f.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const counts = { added: 0, skipped: 0, failed: 0 };
  const usedNames = new Set();
  const nameFor = (file) => {
    let base = slugify(path.basename(file, path.extname(file))) || 'photo';
    while (usedNames.has(base)) base += '-2';
    usedNames.add(base);
    return base;
  };

  for (const file of files) {
    const source = path.join(sourceDir, file);
    const ext = path.extname(file).toLowerCase();
    if (PHOTO_TYPES.has(ext)) counts[await importPhoto(source, destDir, nameFor(file), isChef)]++;
    else if (VIDEO_TYPES.has(ext) && !isChef) counts[await importVideo(source, destDir, nameFor(file))]++;
  }
  return counts;
}

if (!existsSync(INBOX)) {
  console.log('Create a "new-photos" folder with one folder per place inside it, then run this again.');
  process.exit(0);
}

const folders = (await readdir(INBOX, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));
if (folders.length === 0) {
  console.log('No folders found in new-photos/. Add one folder per place (e.g. new-photos/Hotel Name/).');
  process.exit(0);
}

for (const folder of folders) {
  const isChef = folder.name.toLowerCase() === 'chef';
  const slug = isChef ? 'chef' : slugify(folder.name);
  if (!slug) {
    // The folder name becomes the page's web address, which needs English letters.
    console.warn(`! "${folder.name}": please rename this folder using English letters (e.g. "Hotel Name") and run again.`);
    continue;
  }

  const destDir = isChef ? CHEF : path.join(PLACES, slug);
  const counts = await importFolder(path.join(INBOX, folder.name), destDir, isChef);

  let note = '';
  if (!isChef && !existsSync(path.join(destDir, 'index.md'))) {
    await writeFile(path.join(destDir, 'index.md'), starterPage(folder.name));
    note = ' — new place: fill in its details in index.md';
  }
  const target = path.relative(ROOT, destDir);
  console.log(
    `${folder.name} → ${target}: ${counts.added} added` +
      (counts.skipped ? `, ${counts.skipped} already there` : '') +
      (counts.failed ? `, ${counts.failed} failed` : '') +
      note,
  );
}

console.log('\nDone. Once everything looks right on the site, you can empty the new-photos folder.');
