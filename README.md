# Pokémon 3D RPG — Mobile Exploration & Collection Engine

A mobile-first 3D Pokémon exploration, encounter, collection, and battle game built with React 18, Three.js / React Three Fiber, TypeScript, Zustand, and Tailwind CSS.

---

## Features

- **Real Pokémon Architecture**: Canonical Pokédex dataset covering Kanto, Johto, Hoenn, and Sinnoh with authentic base stats, dual typings, learnsets, heights, weights, and abilities.
- **18-Type Matchup System**: Full $18 \times 18$ effectiveness chart with STAB, dual-type compounding ($0\times, 0.25\times, 0.5\times, 1\times, 2\times, 4\times$), and critical hits.
- **Turn-Based Battle Engine**: Action priority ordering (+6 Bag/Switch/Run, +1 Quick Attack/Aqua Jet, 0 standard moves), physical/special category split, damage pipeline, and live combat logs.
- **Advanced Status Conditions**: Burn, Poison, Badly Poisoned (Toxic), Paralysis, Sleep, and Freeze with residual turn damage and stat reduction.
- **Ability Engine**: Overgrow, Blaze, Torrent, Levitate, Flash Fire, Water Absorb, Volt Absorb, Thick Fat, Static, Swift Swim, and Chlorophyll.
- **Multi-Trigger Evolution**: Level up, Evolution Stones (Thunder, Water, Fire, Leaf, Moon, Sun Stones), Friendship, and Trade.
- **7 Ecological World Biomes**: Emerald Meadow, Whispering Woods, Azure Lake, Granite Crags, Shadow Cavern, Windswept Plateau, and Moonlit Sanctuary.
- **High-Fidelity 3D Articulated Pokémon**: Articulated procedural rigs with signature species traits (Pikachu lightning tail & red cheeks, Charmander tail flame, Bulbasaur bulb, Squirtle shell, Pidgey wings, Gastly shadow aura, Onix segmented body, Eevee mane).
- **Comprehensive Item & Inventory System**: Poké Balls (Poké, Great, Ultra, Master Balls), Potions, Revives, Status Remedies, and Evolution Stones.
- **National Pokédex**: Regional filters, 18-type filters, BST/Number sorting, search, and detailed stats cards.
- **Versioned Local Persistence**: Save system v3 with automatic backward-compatible migration.
- **Mobile-First UX**: On-screen dynamic joystick, smooth touch controls, responsive UI.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite**
- **Three.js** + **React Three Fiber** (`@react-three/fiber`, `@react-three/drei`)
- **Zustand** (Local-first state & persistence)
- **Tailwind CSS**
- **Capacitor** (Mobile runtime ready)

---

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```
