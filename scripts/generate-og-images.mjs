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

  const resourcesSvg = baseSvg({
    headline: "Teaching Resources & Games",
    subline: "Classroom games, lesson tools, and teaching aids for educators",
    includeGames: true,
  });

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


