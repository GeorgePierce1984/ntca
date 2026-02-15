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
const inputPath = join(publicDir, "og-resources.png");
const outputPathPng = join(publicDir, "og-resources.png");
const outputPathJpg = join(publicDir, "og-resources.jpg");

// Facebook/WhatsApp recommended OG image size
const WIDTH = 1200;
const HEIGHT = 630;

async function optimizeImage() {
  try {
    console.log(`📐 Optimizing og-resources.png for social media...`);
    
    const imageBuffer = readFileSync(inputPath);
    
    // Create optimized PNG (for Facebook, Twitter)
    const pngBuffer = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ 
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toBuffer();
    
    // Create optimized JPEG (for WhatsApp - prefers JPEG)
    const jpgBuffer = await sharp(imageBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for JPEG
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

