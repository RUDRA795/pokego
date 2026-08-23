/**
 * Pokémon 3D RPG — Complete 3D Animated Asset & Render Pipeline
 * 
 * Downloads authentic 3D animated battle models, Pokémon HOME 3D renders,
 * and high-resolution official artwork for canonical Pokémon species.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { POKEMON_SPECIES_LIST } from '../src/data/pokemon/species';

const baseDir = process.cwd();
const ANIMATED_DIR = path.join(baseDir, 'public/assets/pokemon/animated');
const ANIMATED_SHINY_DIR = path.join(baseDir, 'public/assets/pokemon/animated_shiny');
const HOME_DIR = path.join(baseDir, 'public/assets/pokemon/home');
const ARTWORK_DIR = path.join(baseDir, 'public/assets/pokemon/artwork');
const ICONS_DIR = path.join(baseDir, 'public/assets/pokemon/icons');

[ANIMATED_DIR, ANIMATED_SHINY_DIR, HOME_DIR, ARTWORK_DIR, ICONS_DIR].forEach((dir) => {
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

// Concurrency queue
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
  console.log(`============================================================`);
  console.log(`POKÉMON 3D ANIMATED ASSET & RENDER PIPELINE`);
  console.log(`Downloading authentic 3D animated battle models and renders`);
  console.log(`============================================================\n`);

  const speciesList = POKEMON_SPECIES_LIST;
  let countAnimated = 0;
  let countHome = 0;
  let countArtwork = 0;
  let countIcons = 0;

  await runConcurrent(speciesList, 15, async (species) => {
    const dex = species.nationalDexNumber;
    const id = species.id;

    // 1. Authentic 3D Animated Battle Model (Showdown 3D GIF)
    const animUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${dex}.gif`;
    const animDestDex = path.join(ANIMATED_DIR, `${dex}.gif`);
    const animDestId = path.join(ANIMATED_DIR, `${id}.gif`);

    // 2. Authentic 3D Animated Shiny Model (Showdown Shiny 3D GIF)
    const shinyUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${dex}.gif`;
    const shinyDestDex = path.join(ANIMATED_SHINY_DIR, `${dex}.gif`);
    const shinyDestId = path.join(ANIMATED_SHINY_DIR, `${id}.gif`);

    // 3. Pokémon HOME 3D Render (PNG)
    const homeUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dex}.png`;
    const homeDestDex = path.join(HOME_DIR, `${dex}.png`);
    const homeDestId = path.join(HOME_DIR, `${id}.png`);

    // 4. Official Artwork (PNG)
    const artUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dex}.png`;
    const artDestDex = path.join(ARTWORK_DIR, `${dex}.png`);
    const artDestId = path.join(ARTWORK_DIR, `${id}.png`);

    // 5. Pixel Icon (PNG)
    const iconUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;
    const iconDestDex = path.join(ICONS_DIR, `${dex}.png`);
    const iconDestId = path.join(ICONS_DIR, `${id}.png`);

    const [aOk, sOk, hOk, artOk, iOk] = await Promise.all([
      downloadFile(animUrl, animDestDex),
      downloadFile(shinyUrl, shinyDestDex),
      downloadFile(homeUrl, homeDestDex),
      downloadFile(artUrl, artDestDex),
      downloadFile(iconUrl, iconDestDex),
    ]);

    // Mirror by species id for fast lookup
    if (aOk && !fs.existsSync(animDestId)) try { fs.copyFileSync(animDestDex, animDestId); } catch {}
    if (sOk && !fs.existsSync(shinyDestId)) try { fs.copyFileSync(shinyDestDex, shinyDestId); } catch {}
    if (hOk && !fs.existsSync(homeDestId)) try { fs.copyFileSync(homeDestDex, homeDestId); } catch {}
    if (artOk && !fs.existsSync(artDestId)) try { fs.copyFileSync(artDestDex, artDestId); } catch {}
    if (iOk && !fs.existsSync(iconDestId)) try { fs.copyFileSync(iconDestDex, iconDestId); } catch {}

    if (aOk) countAnimated++;
    if (hOk) countHome++;
    if (artOk) countArtwork++;
    if (iOk) countIcons++;

    console.log(`[Processed] #${dex} ${species.name} — 3D Animated: ${aOk ? '✓' : '✗'}, HOME 3D: ${hOk ? '✓' : '✗'}`);
  });

  console.log('\n============================================================');
  console.log('ANIMATED PIPELINE COMPLETE!');
  console.log(`- 3D Animated Models: ${countAnimated}/${speciesList.length}`);
  console.log(`- Pokémon HOME 3D:    ${countHome}/${speciesList.length}`);
  console.log(`- Official Artwork:   ${countArtwork}/${speciesList.length}`);
  console.log(`- Pokédex Icons:      ${countIcons}/${speciesList.length}`);
  console.log('============================================================');
}

main();
