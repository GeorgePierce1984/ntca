#!/usr/bin/env node
/**
 * Resize og-resources.png to Facebook's recommended 1200x630 dimensions
 * This prevents cropping on social media platforms
 */

import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = new URL("..", import.meta.url).pathname;
const publicDir = join(rootDir, "public");
const inputPath = join(publicDir, "og-resources.png");
const outputPath = join(publicDir, "og-resources.png");

// Facebook's recommended OG image size
const WIDTH = 1200;
const HEIGHT = 630;

async function resizeImage() {
  try {
    console.log(`📐 Resizing og-resources.png to ${WIDTH}x${HEIGHT} (Facebook recommended size)...`);
    
    const imageBuffer = readFileSync(inputPath);
    
    const resizedBuffer = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'contain', // Maintain aspect ratio, add padding if needed
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background for padding
      })
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

