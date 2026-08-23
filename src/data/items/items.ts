/**
 * Pokémon 3D RPG — Canonical Items Database
 * 
 * Defines all items across Poké Balls, Healing, Status Remedies, Evolution Stones, and Battle Boosters.
 */

export type ItemCategory = 'POKE_BALL' | 'HEALING' | 'STATUS_REMEDY' | 'EVOLUTION_STONE' | 'BATTLE_BOOSTER';

export interface GameItem {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  healAmount?: number;
  catchMultiplier?: number;
  curesStatus?: 'BURN' | 'PARALYSIS' | 'POISON' | 'BADLY_POISONED' | 'SLEEP' | 'FREEZE' | 'ALL';
  evolutionStoneName?: string;
  revivesFainted?: boolean;
}

export const GAME_ITEMS_DATABASE: Record<string, GameItem> = {
  // --- Poké Balls ---
  poke_ball: {
    id: 'poke_ball',
    name: 'Poké Ball',
    category: 'POKE_BALL',
    catchMultiplier: 1.0,
    description: 'A device for catching wild Pokémon. It is thrown like a ball at the target.',
  },
  great_ball: {
    id: 'great_ball',
    name: 'Great Ball',
    category: 'POKE_BALL',
    catchMultiplier: 1.5,
    description: 'A good, high-performance Poké Ball with a higher catch rate than a standard Poké Ball.',
  },
  ultra_ball: {
    id: 'ultra_ball',
    name: 'Ultra Ball',
    category: 'POKE_BALL',
    catchMultiplier: 2.0,
    description: 'An ultra-high-performance Poké Ball with a higher catch rate than a Great Ball.',
  },
  master_ball: {
    id: 'master_ball',
    name: 'Master Ball',
    category: 'POKE_BALL',
    catchMultiplier: 255.0,
    description: 'The best Poké Ball with the ultimate level of performance. It catches any wild Pokémon without fail.',
  },

  // --- Healing Potions ---
  potion: {
    id: 'potion',
    name: 'Potion',
    category: 'HEALING',
    healAmount: 20,
    description: 'A spray-type medicine for treating wounds. It restores the HP of one Pokémon by 20 points.',
  },
  super_potion: {
    id: 'super_potion',
    name: 'Super Potion',
    category: 'HEALING',
    healAmount: 50,
    description: 'A spray-type medicine for treating wounds. It restores the HP of one Pokémon by 50 points.',
  },
  hyper_potion: {
    id: 'hyper_potion',
    name: 'Hyper Potion',
    category: 'HEALING',
    healAmount: 120,
    description: 'A spray-type medicine for treating wounds. It restores the HP of one Pokémon by 120 points.',
  },
  max_potion: {
    id: 'max_potion',
    name: 'Max Potion',
    category: 'HEALING',
    healAmount: 9999,
    description: 'A spray-type medicine for treating wounds. It fully restores the HP of one Pokémon.',
  },
  revive: {
    id: 'revive',
    name: 'Revive',
    category: 'HEALING',
    revivesFainted: true,
    description: 'A medicine that can be used to revive a Pokémon that has fainted. It also restores half of the Pokémon\'s max HP.',
  },
  max_revive: {
    id: 'max_revive',
    name: 'Max Revive',
    category: 'HEALING',
    revivesFainted: true,
    healAmount: 9999,
    description: 'A medicine that can be used to revive a Pokémon that has fainted. It also fully restores the Pokémon\'s max HP.',
  },

  // --- Status Remedies ---
  antidote: {
    id: 'antidote',
    name: 'Antidote',
    category: 'STATUS_REMEDY',
    curesStatus: 'POISON',
    description: 'A spray-type medicine for treating poison. It can be used to cure a single Pokémon from the effects of poison.',
  },
  paralyze_heal: {
    id: 'paralyze_heal',
    name: 'Paralyze Heal',
    category: 'STATUS_REMEDY',
    curesStatus: 'PARALYSIS',
    description: 'A spray-type medicine for treating paralysis. It can be used to cure a single Pokémon from paralysis.',
  },
  burn_heal: {
    id: 'burn_heal',
    name: 'Burn Heal',
    category: 'STATUS_REMEDY',
    curesStatus: 'BURN',
    description: 'A spray-type medicine for treating burns. It can be used to cure a single Pokémon from a burn.',
  },
  ice_heal: {
    id: 'ice_heal',
    name: 'Ice Heal',
    category: 'STATUS_REMEDY',
    curesStatus: 'FREEZE',
    description: 'A spray-type medicine for treating freezing. It can be used to thaw out a single frozen Pokémon.',
  },
  awakening: {
    id: 'awakening',
    name: 'Awakening',
    category: 'STATUS_REMEDY',
    curesStatus: 'SLEEP',
    description: 'A spray-type medicine for treating sleep. It can be used to wake up a single sleeping Pokémon.',
  },
  full_heal: {
    id: 'full_heal',
    name: 'Full Heal',
    category: 'STATUS_REMEDY',
    curesStatus: 'ALL',
    description: 'A spray-type medicine that is broadly effective. It can be used to cure all the status conditions of a single Pokémon.',
  },

  // --- Evolution Stones ---
  thunder_stone: {
    id: 'thunder_stone',
    name: 'Thunder Stone',
    category: 'EVOLUTION_STONE',
    evolutionStoneName: 'Thunder Stone',
    description: 'A peculiar stone that can make certain species of Pokémon evolve. It has a distinct thunderbolt pattern.',
  },
  water_stone: {
    id: 'water_stone',
    name: 'Water Stone',
    category: 'EVOLUTION_STONE',
    evolutionStoneName: 'Water Stone',
    description: 'A peculiar stone that can make certain species of Pokémon evolve. It is the blue of a pool of clear water.',
  },
  fire_stone: {
    id: 'fire_stone',
    name: 'Fire Stone',
    category: 'EVOLUTION_STONE',
    evolutionStoneName: 'Fire Stone',
    description: 'A peculiar stone that can make certain species of Pokémon evolve. The stone has a fiery orange heart.',
  },
  leaf_stone: {
    id: 'leaf_stone',
    name: 'Leaf Stone',
    category: 'EVOLUTION_STONE',
    evolutionStoneName: 'Leaf Stone',
    description: 'A peculiar stone that can make certain species of Pokémon evolve. It has an unmistakable leaf pattern.',
  },
  moon_stone: {
    id: 'moon_stone',
    name: 'Moon Stone',
    category: 'EVOLUTION_STONE',
    evolutionStoneName: 'Moon Stone',
    description: 'A peculiar stone that can make certain species of Pokémon evolve. It is as black as the night sky.',
  },
  sun_stone: {
    id: 'sun_stone',
    name: 'Sun Stone',
    category: 'EVOLUTION_STONE',
    evolutionStoneName: 'Sun Stone',
    description: 'A peculiar stone that can make certain species of Pokémon evolve. It is as red as the evening sun.',
  },
};

export const GAME_ITEMS_LIST = Object.values(GAME_ITEMS_DATABASE);
