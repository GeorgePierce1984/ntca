#!/usr/bin/env node

/**
 * Generate PNG favicons from NTCA logo SVG
 * Creates favicon-16x16.png, favicon-32x32.png, and apple-touch-icon.png
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const svgPath = join(publicDir, 'favicon.svg');

console.log('🎨 Generating favicons from NTCA logo...\n');

try {
  // Read the SVG file
  const svgBuffer = readFileSync(svgPath);
  console.log('✓ Read favicon.svg');

  // Generate different sizes
  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
  ];

  for (const { size, name } of sizes) {
    const outputPath = join(publicDir, name);
    
    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  console.log('\n✅ All favicons generated successfully!');
  console.log('\n📝 Note: Browsers may cache favicons. Try:');
  console.log('   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');
  console.log('   - Clear browser cache');
  console.log('   - Use incognito/private mode to test');
  
} catch (error) {
  console.error('❌ Error generating favicons:', error.message);
  process.exit(1);
}

