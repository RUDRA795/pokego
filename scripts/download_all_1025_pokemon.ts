/**
 * Pokémon Game Engine — Full National Pokédex (1 to 1025) Asset Downloader
 * 
 * Downloads official artwork, Pokémon HOME 3D renders, and Pokédex icons
 * for all 1,025 canonical Pokémon across Gens 1-9 (Kanto to Paldea) using
 * a high-concurrency worker pipeline.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const baseDir = process.cwd();
const ARTWORK_DIR = path.join(baseDir, 'public/assets/pokemon/artwork');
const HOME_DIR = path.join(baseDir, 'public/assets/pokemon/home');
const ICONS_DIR = path.join(baseDir, 'public/assets/pokemon/icons');

[ARTWORK_DIR, HOME_DIR, ICONS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
      return resolve(true); // Already cached
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

// Concurrency queue processor
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
  const TOTAL_POKEMON = 1025;
  console.log(`============================================================`);
  console.log(`STARTING BULK DOWNLOAD OF ALL ${TOTAL_POKEMON} CANONICAL POKÉMON`);
  console.log(`Gens 1–9: Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea`);
  console.log(`============================================================\n`);

  const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);

  let completed = 0;
  let successArtwork = 0;
  let successHome = 0;
  let successIcons = 0;

  await runConcurrent(ids, 25, async (dex) => {
    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
    const homeUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dex}.png`;
    const iconUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;

    const artworkDest = path.join(ARTWORK_DIR, `${dex}.png`);
    const homeDest = path.join(HOME_DIR, `${dex}.png`);
    const iconDest = path.join(ICONS_DIR, `${dex}.png`);

    const [aOk, hOk, iOk] = await Promise.all([
      downloadFile(artworkUrl, artworkDest),
      downloadFile(homeUrl, homeDest),
      downloadFile(iconUrl, iconDest),
    ]);

    if (aOk) successArtwork++;
    if (hOk) successHome++;
    if (iOk) successIcons++;

    completed++;
    if (completed % 50 === 0 || completed === TOTAL_POKEMON) {
      const pct = Math.round((completed / TOTAL_POKEMON) * 100);
      console.log(`[Progress ${completed}/${TOTAL_POKEMON} (${pct}%)] National Dex #${dex} downloaded`);
    }
  });

  console.log('\n============================================================');
  console.log(`DOWNLOAD COMPLETE FOR ALL ${TOTAL_POKEMON} POKÉMON!`);
  console.log(`- Official Artwork: ${successArtwork}/${TOTAL_POKEMON}`);
  console.log(`- Pokémon HOME 3D:  ${successHome}/${TOTAL_POKEMON}`);
  console.log(`- Pokédex Icons:    ${successIcons}/${TOTAL_POKEMON}`);
  console.log('============================================================');
}

main();
