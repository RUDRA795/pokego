/**
 * Pokémon 3D RPG — Real Canonical 3D GLB Model Downloader
 * 
 * Downloads authentic, web-optimized 3D GLB models from the Pokemon-3D-api repository
 * into public/models/pokemon/[dex].glb and public/models/pokemon/[speciesId].glb.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { POKEMON_SPECIES_LIST } from '../src/data/pokemon/species';

const baseDir = process.cwd();
const MODELS_DIR = path.join(baseDir, 'public/models/pokemon');

if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve(true); // Already cached
    }

    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      // Handle redirect if any
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        if (fs.existsSync(destPath)) try { fs.unlinkSync(destPath); } catch {}
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          return downloadFile(redirectUrl, destPath).then(resolve);
        }
        return resolve(false);
      }

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

// Concurrency runner
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
  console.log(`DOWNLOADING REAL CANONICAL 3D GLB POKÉMON MODELS`);
  console.log(`============================================================\n`);

  const speciesList = POKEMON_SPECIES_LIST;
  let downloaded = 0;

  await runConcurrent(speciesList, 10, async (species) => {
    const dex = species.nationalDexNumber;
    const modelUrl = `https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular/${dex}.glb`;
    const destDex = path.join(MODELS_DIR, `${dex}.glb`);
    const destId = path.join(MODELS_DIR, `${species.id}.glb`);

    const ok = await downloadFile(modelUrl, destDex);
    if (ok) {
      downloaded++;
      try {
        if (!fs.existsSync(destId)) {
          fs.copyFileSync(destDex, destId);
        }
      } catch {}
      console.log(`[3D Model Downloaded] #${dex} ${species.name} (${species.id}.glb)`);
    } else {
      console.log(`[3D Model Unavailable on upstream] #${dex} ${species.name}`);
    }
  });

  console.log('\n============================================================');
  console.log(`3D GLB MODEL DOWNLOAD COMPLETE: ${downloaded}/${speciesList.length} models ready!`);
  console.log('============================================================');
}

main();
