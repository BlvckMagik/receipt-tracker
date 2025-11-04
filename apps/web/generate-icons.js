import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <path d="M150 120 h212 v20 h-212 z M140 160 l10 250 h212 l10 -250 z M170 180 v200 M256 180 v200 M342 180 v200" 
        stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
  <text x="256" y="90" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
        fill="white" text-anchor="middle">₴</text>
</svg>
`;

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);
  
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(process.cwd(), 'public', 'pwa-192x192.png'));
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(process.cwd(), 'public', 'pwa-512x512.png'));
  
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(process.cwd(), 'public', 'apple-touch-icon.png'));
  
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(process.cwd(), 'public', 'favicon.ico'));

  console.log('Іконки успішно згенеровано!');
}

generateIcons().catch(console.error);

