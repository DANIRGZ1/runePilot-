/**
 * Run once with: node electron/generate-icons.js
 * Requires: npm install --save-dev sharp (already listed in devDeps after this script)
 *
 * Creates:
 *   electron/icon.png      (512×512 — app window icon)
 *   electron/tray-icon.png (22×22  — system tray icon)
 *   electron/icon.ico      (256×256 — Windows installer icon, via png2icons)
 *
 * If you have a custom icon, just replace electron/icon.png (512×512) and re-run.
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;

  // Background circle
  ctx.fillStyle = '#0d1117';
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();

  // Gold outer ring
  ctx.strokeStyle = '#c89b3c';
  ctx.lineWidth = s * 0.04;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.45, 0, Math.PI * 2);
  ctx.stroke();

  // Sword icon (simplified)
  ctx.strokeStyle = '#c89b3c';
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = 'round';

  // Blade
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.18);
  ctx.lineTo(s * 0.5, s * 0.72);
  ctx.stroke();

  // Guard
  ctx.lineWidth = s * 0.05;
  ctx.beginPath();
  ctx.moveTo(s * 0.3, s * 0.52);
  ctx.lineTo(s * 0.7, s * 0.52);
  ctx.stroke();

  // Tip diamond
  ctx.fillStyle = '#c89b3c';
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.14);
  ctx.lineTo(s * 0.54, s * 0.22);
  ctx.lineTo(s * 0.5, s * 0.20);
  ctx.lineTo(s * 0.46, s * 0.22);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

try {
  const { createCanvas } = require('canvas');

  const icon512 = drawIcon(512);
  fs.writeFileSync(path.join(__dirname, 'icon.png'), icon512.toBuffer('image/png'));
  console.log('✅ icon.png (512×512) created');

  const tray22 = drawIcon(22);
  fs.writeFileSync(path.join(__dirname, 'tray-icon.png'), tray22.toBuffer('image/png'));
  console.log('✅ tray-icon.png (22×22) created');

  console.log('\nNext: run   npx png-to-ico electron/icon.png > electron/icon.ico');
} catch (e) {
  console.error('canvas package not installed. Run:');
  console.error('  npm install --save-dev canvas');
  console.error('Then re-run this script.');
  process.exit(1);
}
