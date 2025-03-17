const sharp = require('sharp');
const path = require('path');

const width = 800;
const height = 800;

sharp({
  create: {
    width: width,
    height: height,
    channels: 4,
    background: { r: 200, g: 200, b: 200, alpha: 1 }
  }
})
.composite([{
  input: Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="none"/>
      <text x="50%" y="50%" font-family="Arial" font-size="48" fill="#666" text-anchor="middle">
        Нет изображения
      </text>
    </svg>`
  ),
  top: 0,
  left: 0
}])
.webp({ quality: 85 })
.toFile(path.join(__dirname, '../assets/placeholder.webp'))
.then(() => console.log('Placeholder image created successfully'))
.catch(err => console.error('Error creating placeholder:', err)); 