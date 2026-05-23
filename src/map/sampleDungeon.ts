import {
  TILE_WALL, TILE_FLOOR, TILE_DOOR_CLOSED, TILE_PIT,
  TILE_SECRET_DOOR, TILE_STAIRS_DOWN, TILE_STAIRS_UP,
} from '../types'
import type { LevelData } from '../types'

const W = TILE_WALL
const F = TILE_FLOOR
const D = TILE_DOOR_CLOSED
const P = TILE_PIT
const SD = TILE_SECRET_DOOR
const SU = TILE_STAIRS_UP
const SDN = TILE_STAIRS_DOWN

export const level1: LevelData = {
  id: 'catacombs_1',
  name: 'The Catacombs',
  width: 12,
  height: 12,
  startPosition: { x: 2, y: 2 },
  startFacing: 0,
  tiles: [
    [W,W,W,W,W,W,W,W,W,W,W,W],
    [W,F,F,F,F,W,F,F,F,F,F,W],
    [W,F,F,F,F,W,F,F,F,F,F,W],
    [W,F,F,F,F,D,F,F,F,F,F,W],
    [W,F,F,F,F,W,F,F,F,F,F,W],
    [W,W,W,W,W,W,W,SD,SDN,W,W,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,F,F,F,F,F,F,F,F,F,F,W],
    [W,W,W,W,W,W,W,W,W,W,W,W],
  ],
  encounters: [
    { x: 7, y: 3, enemies: [{ name: 'Goblin', hp: 6, maxHp: 6, ac: 13, thac0: 19, damage: '1d6', damageBonus: 0, xp: 15 }] },
    { x: 5, y: 8, enemies: [{ name: 'Skeleton', hp: 8, maxHp: 8, ac: 14, thac0: 18, damage: '1d8', damageBonus: 0, xp: 25 }] },
  ],
  items: [
    { item: { id: 'short-sword', name: 'Short Sword', type: 'weapon', weight: 3, description: 'A sharp iron blade', effects: { damageDice: '1d6', damageBonus: 0 }, consumable: false }, tileX: 3, tileY: 2 },
    { item: { id: 'healing-potion', name: 'Healing Potion', type: 'potion', weight: 0.5, description: 'Restores 2d4 HP', effects: { hpBonus: 0 }, consumable: true }, tileX: 8, tileY: 7 },
    { item: { id: 'leather-armor', name: 'Leather Armor', type: 'armor', weight: 10, description: 'Hardened leather protection', effects: { acBonus: 2 }, consumable: false }, tileX: 4, tileY: 9 },
  ],
  transitions: [
    { tileX: 8, tileY: 5, targetLevelId: 'catacombs_2', targetPosition: { x: 8, y: 2 }, targetFacing: 0 },
  ],
}

export const level2: LevelData = {
  id: 'catacombs_2',
  name: 'The Crypts',
  width: 12,
  height: 12,
  startPosition: { x: 2, y: 2 },
  startFacing: 0,
  tiles: [
    [W,W,W,W,W,W,W,W,W,W,W,W],
    [W,F,F,F,F,F,W,F,F,F,F,W],
    [W,F,F,F,F,F,SU,F,F,F,F,W],
    [W,F,F,F,D,F,W,F,F,F,F,W],
    [W,F,F,F,F,F,W,F,F,F,F,W],
    [W,W,W,W,W,W,W,W,W,W,W,W],
    [W,P,W,F,F,F,F,F,F,F,F,W],
    [W,F,W,F,F,F,F,F,F,F,F,W],
    [W,F,W,F,F,F,D,F,F,F,F,W],
    [W,F,W,F,F,F,F,W,W,W,F,W],
    [W,F,F,F,F,F,F,W,F,F,F,W],
    [W,W,W,W,W,W,W,W,W,W,W,W],
  ],
  encounters: [
    { x: 1, y: 7, enemies: [{ name: 'Skeleton', hp: 10, maxHp: 10, ac: 14, thac0: 17, damage: '1d8', damageBonus: 1, xp: 35 }] },
    { x: 1, y: 9, enemies: [{ name: 'Skeleton', hp: 10, maxHp: 10, ac: 14, thac0: 17, damage: '1d8', damageBonus: 1, xp: 35 }] },
    { x: 10, y: 8, enemies: [{ name: 'Zombie', hp: 15, maxHp: 15, ac: 12, thac0: 16, damage: '1d6', damageBonus: 2, xp: 50 }] },
  ],
  items: [
    { item: { id: 'iron-shield', name: 'Iron Shield', type: 'shield', weight: 6, description: 'A sturdy iron shield', effects: { acBonus: 2 }, consumable: false }, tileX: 10, tileY: 1 },
    { item: { id: 'healing-potion-2', name: 'Healing Potion', type: 'potion', weight: 0.5, description: 'Restores 2d4 HP', effects: { hpBonus: 0 }, consumable: true }, tileX: 5, tileY: 10 },
  ],
  transitions: [
    { tileX: 8, tileY: 2, targetLevelId: 'catacombs_1', targetPosition: { x: 8, y: 5 }, targetFacing: 0 },
  ],
}
