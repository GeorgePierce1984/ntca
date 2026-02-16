#!/usr/bin/env node
/**
 * Resize og-image.png to Facebook's recommended 1200x630 dimensions
 * This is the default OG image for all pages except resources
 */

import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = new URL("..", import.meta.url).pathname;
const publicDir = join(rootDir, "public");
// Use source file if available, otherwise use existing
const inputPath = join(publicDir, "og-image-source.png");
const fallbackPath = join(publicDir, "og-image.png");
const outputPath = join(publicDir, "og-image.png");

// Facebook's recommended OG image size
const WIDTH = 1200;
const HEIGHT = 630;

async function resizeImage() {
  try {
    console.log(`📐 Resizing og-image.png to ${WIDTH}x${HEIGHT} (Facebook recommended size)...`);
    
    // Use source file if available, otherwise fallback to existing
    let imagePath = inputPath;
    try {
      readFileSync(inputPath);
    } catch {
      imagePath = fallbackPath;
      console.log(`⚠️  Source file not found, using existing og-image.png`);
    }
    
    const imageBuffer = readFileSync(imagePath);
    
    // Get original image dimensions
    const originalMetadata = await sharp(imageBuffer).metadata();
    console.log(`📏 Original image: ${originalMetadata.width}x${originalMetadata.height}`);
    
    // Calculate if we need to crop from top or use contain
    // If original is taller than target ratio, use 'cover' with 'top' position
    // Otherwise, use 'contain' to preserve entire image
    const originalRatio = originalMetadata.width / originalMetadata.height;
    const targetRatio = WIDTH / HEIGHT;
    
    let resizeOptions;
    if (originalRatio < targetRatio) {
      // Original is taller/narrower - use cover with top position to preserve logo
      console.log(`📐 Using 'cover' with 'top' position to preserve logo`);
      resizeOptions = {
        fit: 'cover',
        position: 'top'
      };
    } else {
      // Original is wider/shorter - use contain to show full image
      console.log(`📐 Using 'contain' to show full image`);
      resizeOptions = {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      };
    }
    
    const resizedBuffer = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, resizeOptions)
      .png({ quality: 90 })
      .toBuffer();
    
    writeFileSync(outputPath, resizedBuffer);
    
    const stats = await sharp(resizedBuffer).metadata();
    console.log(`✅ Resized to ${stats.width}x${stats.height}`);
    console.log(`✅ File size: ${(resizedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
  } catch (error) {
    console.error("❌ Error resizing image:", error);
    process.exit(1);
  }
}

resizeImage();

