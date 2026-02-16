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
const inputPath = join(publicDir, "og-image.png");
const outputPath = join(publicDir, "og-image.png");

// Facebook's recommended OG image size
const WIDTH = 1200;
const HEIGHT = 630;

async function resizeImage() {
  try {
    console.log(`📐 Resizing og-image.png to ${WIDTH}x${HEIGHT} (Facebook recommended size)...`);
    
    const imageBuffer = readFileSync(inputPath);
    
    const resizedBuffer = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'cover', // Fill the frame, may crop edges
        position: 'center' // Center the image when cropping
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

