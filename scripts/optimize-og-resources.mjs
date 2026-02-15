#!/usr/bin/env node
/**
 * Optimize og-resources.png for WhatsApp and other social platforms
 * WhatsApp prefers JPEG format and has stricter size requirements
 */

import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = new URL("..", import.meta.url).pathname;
const publicDir = join(rootDir, "public");
// Try to use source file if it exists, otherwise use the current og-resources.png
const inputPath = join(publicDir, "og-resources-source.png");
const fallbackPath = join(publicDir, "og-resources.png");
const outputPathPng = join(publicDir, "og-resources.png");
const outputPathJpg = join(publicDir, "og-resources.jpg");

// Facebook/WhatsApp recommended OG image size
const WIDTH = 1200;
const HEIGHT = 630;

async function optimizeImage() {
  try {
    console.log(`📐 Optimizing og-resources.png for social media...`);
    
    // Use source file if available, otherwise fallback to existing
    let imagePath = inputPath;
    try {
      readFileSync(inputPath);
    } catch {
      imagePath = fallbackPath;
      console.log(`⚠️  Source file not found, using existing og-resources.png`);
    }
    
    const imageBuffer = readFileSync(imagePath);
    
    // Create optimized PNG (for Facebook, Twitter)
    // Use 'cover' with 'top' position to ensure logo at top is preserved
    const pngBuffer = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'cover',
        position: 'top' // Preserve top content (logo)
      })
      .png({ 
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toBuffer();
    
    // Create optimized JPEG (for WhatsApp - prefers JPEG)
    // Use 'cover' with 'top' position to ensure logo at top is preserved
    const jpgBuffer = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'cover',
        position: 'top' // Preserve top content (logo)
      })
      .jpeg({ 
        quality: 90,
        mozjpeg: true
      })
      .toBuffer();
    
    writeFileSync(outputPathPng, pngBuffer);
    writeFileSync(outputPathJpg, jpgBuffer);
    
    const pngStats = await sharp(pngBuffer).metadata();
    const jpgStats = await sharp(jpgBuffer).metadata();
    
    console.log(`✅ PNG: ${pngStats.width}x${pngStats.height}, ${(pngBuffer.length / 1024).toFixed(0)}KB`);
    console.log(`✅ JPEG: ${jpgStats.width}x${jpgStats.height}, ${(jpgBuffer.length / 1024).toFixed(0)}KB`);
    
  } catch (error) {
    console.error("❌ Error optimizing image:", error);
    process.exit(1);
  }
}

optimizeImage();

