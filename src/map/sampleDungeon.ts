import { TILE_WALL, TILE_FLOOR, TILE_DOOR_CLOSED, TILE_PIT, TILE_SECRET_DOOR } from '../types'
import type { MapData, EncounterTrigger, MapItem } from '../types'

const W = TILE_WALL
const F = TILE_FLOOR
const D = TILE_DOOR_CLOSED
const P = TILE_PIT
const SD = TILE_SECRET_DOOR

export const sampleDungeon: MapData = {
  width: 12,
  height: 12,
  startPosition: { x: 2, y: 2 },
  startFacing: 0,
  name: 'The Catacombs',
  tiles: [
    [W,W,W,W,W,W,W,W,W,W,W,W],
    [W,F,F,F,F,W,F,F,F,F,F,W],
    [W,F,F,F,F,W,F,F,F,F,F,W],
    [W,F,F,F,F,D,F,F,F,F,F,W],
    [W,F,F,F,F,W,F,F,F,F,F,W],
    [W,W,W,W,W,W,W,SD,P,W,W,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,W,W,W,W,W,W,W,W,W,W,W],
  ],
}

export const sampleMapItems: MapItem[] = [
  {
    item: { id: 'short-sword', name: 'Short Sword', type: 'weapon', weight: 3, description: 'A sharp iron blade', effects: { damageDice: '1d6', damageBonus: 0 }, consumable: false },
    tileX: 3, tileY: 2,
  },
  {
    item: { id: 'healing-potion', name: 'Healing Potion', type: 'potion', weight: 0.5, description: 'Restores 2d4 HP', effects: { hpBonus: 0 }, consumable: true },
    tileX: 8, tileY: 7,
  },
  {
    item: { id: 'leather-armor', name: 'Leather Armor', type: 'armor', weight: 10, description: 'Hardened leather protection', effects: { acBonus: 2 }, consumable: false },
    tileX: 4, tileY: 9,
  },
]

export const sampleEncounters: EncounterTrigger[] = [
  {
    x: 7, y: 3,
    enemies: [{ name: 'Goblin', hp: 6, maxHp: 6, ac: 13, thac0: 19, damage: '1d6', damageBonus: 0, xp: 15 }],
  },
  {
    x: 5, y: 8,
    enemies: [{ name: 'Skeleton', hp: 8, maxHp: 8, ac: 14, thac0: 18, damage: '1d8', damageBonus: 0, xp: 25 }],
  },
]
