/**
 * Pokémon 3D RPG — Bulk 1,025 3D Animated Battle Model & Render Downloader
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const baseDir = process.cwd();
const ANIMATED_DIR = path.join(baseDir, 'public/assets/pokemon/animated');
const HOME_DIR = path.join(baseDir, 'public/assets/pokemon/home');
const ARTWORK_DIR = path.join(baseDir, 'public/assets/pokemon/artwork');
const ICONS_DIR = path.join(baseDir, 'public/assets/pokemon/icons');

[ANIMATED_DIR, HOME_DIR, ARTWORK_DIR, ICONS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
      return resolve(true);
    }

    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        if (fs.existsSync(destPath)) {
          try { fs.unlinkSync(destPath); } catch {}
        }
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      if (fs.existsSync(destPath)) {
        try { fs.unlinkSync(destPath); } catch {}
      }
      resolve(false);
    });
  });
}

async function runConcurrent<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>) {
  let index = 0;
  const workers = new Array(concurrency).fill(0).map(async () => {
    while (index < items.length) {
      const current = items[index++];
      await fn(current);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const TOTAL = 1025;
  console.log(`Downloading 3D Animated assets and renders for all ${TOTAL} Pokémon...`);

  const ids = Array.from({ length: TOTAL }, (_, i) => i + 1);
  let completed = 0;

  await runConcurrent(ids, 30, async (dex) => {
    const animUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${dex}.gif`;
    const homeUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dex}.png`;
    const artUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
    const iconUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;

    const animDest = path.join(ANIMATED_DIR, `${dex}.gif`);
    const homeDest = path.join(HOME_DIR, `${dex}.png`);
    const artDest = path.join(ARTWORK_DIR, `${dex}.png`);
    const iconDest = path.join(ICONS_DIR, `${dex}.png`);

    await Promise.all([
      downloadFile(animUrl, animDest),
      downloadFile(homeUrl, homeDest),
      downloadFile(artUrl, artDest),
      downloadFile(iconUrl, iconDest),
    ]);

    completed++;
    if (completed % 100 === 0 || completed === TOTAL) {
      console.log(`[Progress ${completed}/${TOTAL} (${Math.round((completed / TOTAL) * 100)}%)]`);
    }
  });

  console.log(`Completed all ${TOTAL} Pokémon downloads!`);
}

main();
