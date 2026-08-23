/**
 * Pokémon 3D RPG — Automated Asset Downloader
 * 
 * Downloads official artwork, Pokémon HOME 3D renders, and Showdown sprites
 * for all species registered in POKEMON_SPECIES_LIST into local public folders.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { POKEMON_SPECIES_LIST } from '../src/data/pokemon/species';

const baseDir = process.cwd();
const ARTWORK_DIR = path.join(baseDir, 'public/assets/pokemon/artwork');
const HOME_DIR = path.join(baseDir, 'public/assets/pokemon/home');
const SHOWDOWN_DIR = path.join(baseDir, 'public/assets/pokemon/showdown');
const ICONS_DIR = path.join(baseDir, 'public/assets/pokemon/icons');

[ARTWORK_DIR, HOME_DIR, SHOWDOWN_DIR, ICONS_DIR].forEach((dir) => {
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
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

async function main() {
  console.log(`Starting asset download for ${POKEMON_SPECIES_LIST.length} Pokémon species...`);

  let successArtwork = 0;
  let successHome = 0;
  let successShowdown = 0;
  let successIcons = 0;

  for (let i = 0; i < POKEMON_SPECIES_LIST.length; i++) {
    const species = POKEMON_SPECIES_LIST[i];
    const dex = species.nationalDexNumber;
    const name = species.name;

    // 1. Official Artwork (Crisp 475x475 PNG)
    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
    const artworkDest = path.join(ARTWORK_DIR, `${species.id}.png`);
    const artworkDexDest = path.join(ARTWORK_DIR, `${dex}.png`);
    
    // 2. Pokémon HOME 3D Render PNG
    const homeUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dex}.png`;
    const homeDest = path.join(HOME_DIR, `${species.id}.png`);
    const homeDexDest = path.join(HOME_DIR, `${dex}.png`);

    // 3. Showdown Animated 3D Sprite GIF
    const showdownUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${dex}.gif`;
    const showdownDest = path.join(SHOWDOWN_DIR, `${species.id}.gif`);

    // 4. Pixel Icon PNG
    const iconUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;
    const iconDest = path.join(ICONS_DIR, `${species.id}.png`);

    const [aOk, hOk, sOk, iOk] = await Promise.all([
      downloadFile(artworkUrl, artworkDest),
      downloadFile(homeUrl, homeDest),
      downloadFile(showdownUrl, showdownDest),
      downloadFile(iconUrl, iconDest),
    ]);

    // Also copy by dex number
    if (aOk && fs.existsSync(artworkDest) && !fs.existsSync(artworkDexDest)) {
      try { fs.copyFileSync(artworkDest, artworkDexDest); } catch {}
    }
    if (hOk && fs.existsSync(homeDest) && !fs.existsSync(homeDexDest)) {
      try { fs.copyFileSync(homeDest, homeDexDest); } catch {}
    }

    if (aOk) successArtwork++;
    if (hOk) successHome++;
    if (sOk) successShowdown++;
    if (iOk) successIcons++;

    if ((i + 1) % 10 === 0 || i === POKEMON_SPECIES_LIST.length - 1) {
      console.log(`[Progress ${i + 1}/${POKEMON_SPECIES_LIST.length}] ${name} (#${dex}) — Artwork: ${aOk ? '✓' : '✗'}, HOME 3D: ${hOk ? '✓' : '✗'}`);
    }
  }

  console.log('\n============================================================');
  console.log('POKÉMON ASSET DOWNLOAD COMPLETE!');
  console.log(`- Official Artwork: ${successArtwork}/${POKEMON_SPECIES_LIST.length}`);
  console.log(`- Pokémon HOME 3D:  ${successHome}/${POKEMON_SPECIES_LIST.length}`);
  console.log(`- Showdown Sprites:  ${successShowdown}/${POKEMON_SPECIES_LIST.length}`);
  console.log(`- Standard Icons:    ${successIcons}/${POKEMON_SPECIES_LIST.length}`);
  console.log('============================================================');
}

main();
