#!/usr/bin/env node
/**
 * Generates build/icon.png (1024×1024) for the Electron app icon.
 * Uses build/icon-source.png (product photo) if present, otherwise build/icon.svg.
 * Run: npm run build:icon
 */
const path = require('path')
const fs = require('fs')

const size = 1024
const buildDir = path.join(__dirname, '..', 'build')
const out = path.join(buildDir, 'icon.png')
const sourceImage = path.join(buildDir, 'icon-source.png')
const sourceSvg = path.join(buildDir, 'icon.svg')

async function main() {
  let sharp
  try {
    sharp = require('sharp')
  } catch {
    console.error('Run: npm install --save-dev sharp')
    process.exit(1)
  }

  if (fs.existsSync(sourceImage)) {
    const meta = await sharp(sourceImage).metadata()
    const w = meta.width || 1
    const h = meta.height || 1
    const cropSize = Math.min(w, h)
    await sharp(sourceImage)
      .extract({
        left: Math.floor((w - cropSize) / 2),
        top: Math.floor((h - cropSize) / 2),
        width: cropSize,
        height: cropSize,
      })
      .resize(size, size)
      .png()
      .toFile(out)
    console.log('Generated build/icon.png (%d×%d) from product photo', size, size)
  } else if (fs.existsSync(sourceSvg)) {
    await sharp(sourceSvg)
      .resize(size, size)
      .png()
      .toFile(out)
    console.log('Generated build/icon.png (%d×%d) from icon.svg', size, size)
  } else {
    console.error('Missing build/icon-source.png or build/icon.svg')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
