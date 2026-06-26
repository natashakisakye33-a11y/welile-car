const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'welile_car_logo.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input image not found:', inputPath);
    return;
  }

  try {
    // Generate 192x192
    await sharp(inputPath)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'pwa-192x192.png'));
    console.log('Generated pwa-192x192.png');

    // Generate 512x512
    await sharp(inputPath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'pwa-512x512.png'));
    console.log('Generated pwa-512x512.png');

    // Generate apple-touch-icon
    await sharp(inputPath)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');
    
    // Generate favicon.png
    await sharp(inputPath)
      .resize(64, 64, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'favicon.png'));
    console.log('Generated favicon.png');
    
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
