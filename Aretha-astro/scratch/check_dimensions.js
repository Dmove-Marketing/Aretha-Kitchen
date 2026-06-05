import fs from 'fs';
import path from 'path';

// Simple function to read image dimensions from headers for JPEG and WebP
function getDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.webp') {
    // WebP header parsing
    const header = buffer.toString('ascii', 0, 4);
    if (header !== 'RIFF') return null;
    const format = buffer.toString('ascii', 8, 12);
    if (format !== 'WEBP') return null;

    const type = buffer.toString('ascii', 12, 16);
    if (type === 'VP8 ') {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height };
    } else if (type === 'VP8L') {
      const val = buffer.readUInt32LE(21);
      const width = (val & 0x3fff) + 1;
      const height = ((val >> 14) & 0x3fff) + 1;
      return { width, height };
    } else if (type === 'VP8X') {
      const width = (buffer.readUInt32LE(24) & 0xffffff) + 1;
      const height = (buffer.readUInt32LE(27) & 0xffffff) + 1;
      return { width, height };
    }
  } else if (ext === '.jpeg' || ext === '.jpg') {
    // JPEG header parsing
    let i = 0;
    if (buffer[i] !== 0xff || buffer[i + 1] !== 0xd8) return null;
    i += 2;
    while (i < buffer.length) {
      while (buffer[i] === 0xff) i++;
      const marker = buffer[i];
      i++;
      if (marker === 0xd9) break; // EOI
      const length = buffer.readUInt16BE(i);
      if (marker >= 0xc0 && marker <= 0xc3) {
        const height = buffer.readUInt16BE(i + 3);
        const width = buffer.readUInt16BE(i + 5);
        return { width, height };
      }
      i += length;
    }
  }
  return null;
}

const dir = 'src/assets/images';
const files = fs.readdirSync(dir);
const results = {};

files.forEach(file => {
  if (file.includes('gastronomia') || file.includes('galeria-gastronomia') || file.includes('imagens-gastronomia')) {
    const p = path.join(dir, file);
    try {
      const dim = getDimensions(p);
      results[file] = dim ? `${dim.width}x${dim.height}` : 'unknown';
    } catch (e) {
      results[file] = 'error: ' + e.message;
    }
  }
});

console.log(JSON.stringify(results, null, 2));
