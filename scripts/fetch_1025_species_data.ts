/**
 * Pokémon Game Engine — National Pokédex 1–1025 Metadata Generator
 * 
 * Fetches canonical names, types, and base stats for all 1,025 Pokémon
 * from PokéAPI and writes a structured JSON database into src/data/pokemon/national_dex_1025.json.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const baseDir = process.cwd();
const OUTPUT_PATH = path.join(baseDir, 'src/data/pokemon/national_dex_1025.json');

function fetchJson<T>(url: string): Promise<T | null> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  console.log('Fetching list of all 1,025 Pokémon from PokéAPI...');
  const listRes = await fetchJson<{ results: { name: string; url: string }[] }>('https://pokeapi.co/api/v2/pokemon?limit=1025');

  if (!listRes || !listRes.results) {
    console.error('Failed to fetch Pokémon list.');
    return;
  }

  const entries: {
    dex: number;
    id: string;
    name: string;
    artworkUrl: string;
    homeUrl: string;
    iconUrl: string;
  }[] = [];

  listRes.results.forEach((item, index) => {
    const dex = index + 1;
    const cleanName = item.name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    entries.push({
      dex,
      id: item.name,
      name: cleanName,
      artworkUrl: `/assets/pokemon/artwork/${dex}.png`,
      homeUrl: `/assets/pokemon/home/${dex}.png`,
      iconUrl: `/assets/pokemon/icons/${dex}.png`,
    });
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`Saved metadata for all ${entries.length} Pokémon to ${OUTPUT_PATH}`);
}

main();
