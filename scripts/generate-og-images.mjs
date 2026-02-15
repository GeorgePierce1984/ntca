#!/usr/bin/env node
/**
 * Generates OpenGraph/Twitter preview images into /public:
 * - og-image.png (site-wide)
 * - og-teacher.png (teacher signup)
 * - og-resources.png (resources page - games themed)
 *
 * Requires: sharp (devDependency)
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = new URL("..", import.meta.url).pathname;
const publicDir = join(rootDir, "public");

mkdirSync(publicDir, { recursive: true });

const W = 1200;
const H = 630;

function baseSvg({ headline, subline, includeGames = false }) {
  // Inline "logo" (rounded square + cap) to avoid external fetches.
const logo = `
    <g transform="translate(80, 110)">
      <defs>
        <linearGradient id="ntcaOgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="50%" stop-color="#9333ea"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="140" height="140" rx="28" fill="url(#ntcaOgGrad)"/>
      <g fill="#ffffff" opacity="0.96" transform="translate(70, 68) scale(1.4)">
        <path d="M-32 -10 L0 -26 L32 -10 L0 6 Z" />
        <rect x="-2" y="6" width="4" height="28" />
      </g>
    </g>
`;

  // Games-themed decorative elements
  const gamesElements = includeGames ? `
    <!-- Game controller icon -->
    <g transform="translate(900, 200)">
      <circle cx="0" cy="0" r="45" fill="#ffffff" opacity="0.15"/>
      <rect x="-25" y="-15" width="50" height="30" rx="8" fill="#ffffff" opacity="0.2"/>
      <circle cx="-15" cy="0" r="6" fill="#ffffff" opacity="0.4"/>
      <circle cx="15" cy="0" r="6" fill="#ffffff" opacity="0.4"/>
      <rect x="-8" y="-8" width="16" height="6" rx="3" fill="#ffffff" opacity="0.3"/>
    </g>
    <!-- Dice icon -->
    <g transform="translate(1000, 350)">
      <rect x="-20" y="-20" width="40" height="40" rx="6" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="2" stroke-opacity="0.3"/>
      <circle cx="-10" cy="-10" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="10" cy="10" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="-10" cy="10" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="10" cy="-10" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.5"/>
    </g>
    <!-- Puzzle piece icon -->
    <g transform="translate(1050, 200)">
      <path d="M-20 -20 L20 -20 L20 0 L10 0 L10 20 L-10 20 L-10 0 L-20 0 Z" 
            fill="#ffffff" opacity="0.12" stroke="#ffffff" stroke-width="2" stroke-opacity="0.25"/>
    </g>
    <!-- Star icon -->
    <g transform="translate(950, 450)">
      <path d="M0 -18 L5 -5 L18 -5 L8 2 L12 15 L0 8 L-12 15 L-8 2 L-18 -5 L-5 -5 Z" 
            fill="#ffffff" opacity="0.2"/>
    </g>
  ` : '';

  // Large soft glow behind logo
  const glow = `
    <circle cx="160" cy="180" r="180" fill="#ffffff" opacity="0.08" />
  `;

  // Background + overlay for readability
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="50%" stop-color="#9333ea"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="#000000" opacity="0.18"/>

    ${glow}
    ${logo}
    ${gamesElements}

    <g filter="url(#shadow)">
      <rect x="260" y="120" width="860" height="390" rx="32" fill="#0b1220" opacity="0.55"/>
    </g>

    <text x="310" y="220" fill="#ffffff"
      font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Arial, sans-serif"
      font-size="56" font-weight="800" letter-spacing="-0.6">
      ${escapeXml(headline)}
    </text>

    <text x="310" y="280" fill="#ffffff"
      font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Arial, sans-serif"
      font-size="28" font-weight="500" opacity="0.95">
      ${escapeXml(subline)}
    </text>

    <text x="310" y="420" fill="#ffffff"
      font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Arial, sans-serif"
      font-size="22" font-weight="600" opacity="0.9">
      www.nt-ca.com
    </text>
  </svg>
  `;
}

function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function renderPng(svg, outPath) {
  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ quality: 90 })
    .toBuffer();
  writeFileSync(outPath, pngBuffer);
}

async function main() {
  console.log("🖼️  Generating OG images...");

  const siteSvg = baseSvg({
    headline: "NTCA",
    subline: "Direct hiring for schools and teachers across Central Asia",
  });

  const teacherSvg = baseSvg({
    headline: "Join the NTCA Teacher Network",
    subline: "Schools across Central Asia are hiring for 2026 and beyond",
  });

  // Resources page - Owl/Central Asia themed
  const resourcesSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bgResources" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a"/>
        <stop offset="50%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      <linearGradient id="centralAsiaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
      <linearGradient id="fasterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ec4899"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
      <radialGradient id="earthGlow">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2"/>
      </radialGradient>
    </defs>

    <!-- Background - Starry night sky -->
    <rect width="${W}" height="${H}" fill="url(#bgResources)"/>
    
    <!-- Stars -->
    ${Array.from({ length: 150 }, (_, i) => {
      const x = (i * 37) % W;
      const y = (i * 23) % (H * 0.6);
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.8 + 0.2;
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="#ffffff" opacity="${opacity}"/>`;
    }).join('')}
    
    <!-- Milky Way band -->
    <ellipse cx="${W/2}" cy="${H*0.3}" rx="${W*0.4}" ry="${H*0.15}" fill="#ffffff" opacity="0.1"/>

    <!-- Earth with Central Asia highlighted -->
    <g transform="translate(${W*0.5}, ${H*0.65})">
      <!-- Earth base -->
      <circle cx="0" cy="0" r="280" fill="#1e40af" opacity="0.3"/>
      <!-- City lights glow (Central Asia region) -->
      <ellipse cx="-80" cy="20" rx="120" ry="80" fill="url(#earthGlow)"/>
      <ellipse cx="-60" cy="40" rx="100" ry="60" fill="#fbbf24" opacity="0.4"/>
      <!-- Network lines -->
      ${Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45) * Math.PI / 180;
        const x1 = -80 + Math.cos(angle) * 50;
        const y1 = 20 + Math.sin(angle) * 50;
        const x2 = -80 + Math.cos(angle) * 150;
        const y2 = 20 + Math.sin(angle) * 150;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fbbf24" stroke-width="2" opacity="0.3"/>`;
      }).join('')}
    </g>

    <!-- Owl character -->
    <g transform="translate(${W*0.75}, ${H*0.5})">
      <!-- Owl body -->
      <ellipse cx="0" cy="20" rx="60" ry="80" fill="#8b5a3c"/>
      <ellipse cx="0" cy="10" rx="70" ry="90" fill="#a67c52"/>
      <!-- Owl face -->
      <circle cx="-20" cy="-10" r="25" fill="#ffffff" opacity="0.3"/>
      <circle cx="20" cy="-10" r="25" fill="#ffffff" opacity="0.3"/>
      <!-- Eyes -->
      <circle cx="-20" cy="-10" r="18" fill="#1a1a1a"/>
      <circle cx="20" cy="-10" r="18" fill="#1a1a1a"/>
      <circle cx="-18" cy="-12" r="6" fill="#ffffff"/>
      <circle cx="22" cy="-12" r="6" fill="#ffffff"/>
      <!-- Beak -->
      <polygon points="0,-5 8,5 -8,5" fill="#f97316"/>
      <!-- Winter hat -->
      <ellipse cx="0" cy="-50" rx="50" ry="25" fill="#ffffff"/>
      <rect x="-50" y="-50" width="100" height="20" fill="#ffffff"/>
      <!-- Hat pattern -->
      <rect x="-45" y="-48" width="90" height="8" fill="url(#centralAsiaGrad)" opacity="0.8"/>
      <!-- Scarf -->
      <ellipse cx="0" cy="15" rx="65" ry="20" fill="#ec4899" opacity="0.9"/>
      <ellipse cx="0" cy="15" rx="55" ry="15" fill="#3b82f6" opacity="0.7"/>
      <ellipse cx="0" cy="15" rx="45" ry="12" fill="#06b6d4" opacity="0.6"/>
      <!-- Feet on rock -->
      <ellipse cx="-15" cy="80" rx="25" ry="15" fill="#4b5563"/>
      <ellipse cx="15" cy="80" rx="25" ry="15" fill="#4b5563"/>
      <ellipse cx="-15" cy="75" rx="20" ry="10" fill="#6b7280"/>
      <ellipse cx="15" cy="75" rx="20" ry="10" fill="#6b7280"/>
    </g>

    <!-- NTCA Logo (top left) -->
    <g transform="translate(80, 80)">
      <path d="M0,0 L30,0 L30,20 L20,20 L20,30 L0,30 Z" fill="#9333ea" opacity="0.9"/>
      <text x="40" y="20" fill="#ffffff" font-family="Arial, sans-serif" font-size="32" font-weight="bold">NTCA</text>
      <text x="40" y="35" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" opacity="0.9">NexTeach Central Asia</text>
    </g>

    <!-- Main headline -->
    <g filter="url(#shadow)">
      <text x="80" y="180" fill="#ffffff" font-family="Arial, sans-serif" font-size="64" font-weight="800">Hire International Teachers</text>
      <text x="80" y="240" fill="url(#centralAsiaGrad)" font-family="Arial, sans-serif" font-size="56" font-weight="800">Central Asia</text>
      <text x="420" y="240" fill="url(#fasterGrad)" font-family="Arial, sans-serif" font-size="56" font-weight="800">– Faster</text>
    </g>

    <!-- Bullet points -->
    <g transform="translate(80, 280)">
      <circle cx="10" cy="0" r="8" fill="#10b981"/>
      <text x="30" y="5" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="600">Direct Hiring, No Agencies</text>
      <circle cx="10" cy="40" r="8" fill="#10b981"/>
      <text x="30" y="45" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="600">Teachers Ready for 2026</text>
      <circle cx="10" cy="80" r="8" fill="#10b981"/>
      <text x="30" y="85" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="600">Region-Specific Network</text>
    </g>

    <!-- Website banner -->
    <rect x="${W*0.2}" y="${H-80}" width="${W*0.6}" height="60" rx="8" fill="#1e3a8a" opacity="0.8"/>
    <text x="${W*0.5}" y="${H-40}" fill="#ffffff" font-family="Arial, sans-serif" font-size="36" font-weight="700" text-anchor="middle">www.nt-ca.com</text>
  </svg>
  `;

  await renderPng(siteSvg, join(publicDir, "og-image.png"));
  await renderPng(teacherSvg, join(publicDir, "og-teacher.png"));
  await renderPng(resourcesSvg, join(publicDir, "og-resources.png"));

  console.log("✅ Wrote /public/og-image.png");
  console.log("✅ Wrote /public/og-teacher.png");
  console.log("✅ Wrote /public/og-resources.png");
}

main().catch((err) => {
  console.error("❌ Failed to generate OG images:", err);
  process.exit(1);
});


