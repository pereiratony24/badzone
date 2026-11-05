import sharp from 'sharp';
import fs from 'fs';

const outputDir = './public/icons';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processIcon(inputPath, suffix) {
  // Icône 192x192 pour la PWA
  await sharp(inputPath)
    .resize(192, 192)
    .png()
    .toFile(`${outputDir}/icon-${suffix}-192.png`);

  // Icône 512x512 pour la PWA
  await sharp(inputPath)
    .resize(512, 512)
    .png()
    .toFile(`${outputDir}/icon-${suffix}-512.png`);

  // Favicon 32x32 pour l'onglet navigateur
  await sharp(inputPath)
    .resize(32, 32)
    .png()
    .toFile(`${outputDir}/favicon-${suffix}.png`);

  console.log(`✅ Formats PNG générés pour : ${suffix}`);
}

await processIcon('./icon-prod-source.jpg', 'prod');
await processIcon('./icon-dev-source.jpg', 'dev');