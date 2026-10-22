import type { APIRoute } from 'astro';
import { site } from '../config';

// The OZ monogram from the logo, built from the name so it updates with it.
export const GET: APIRoute = () => {
  const initials = site.name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#f7f3ef"/>
  <text x="32" y="45" text-anchor="middle" font-family="'Bodoni 72', Didot, 'Bodoni MT', 'Times New Roman', serif" font-size="36" letter-spacing="-3" fill="#bd959c">${initials}</text>
</svg>`;

  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
