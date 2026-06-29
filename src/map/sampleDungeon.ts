import {
  TILE_WALL, TILE_FLOOR, TILE_DOOR_CLOSED, TILE_PIT,
  TILE_SECRET_DOOR, TILE_STAIRS_DOWN, TILE_STAIRS_UP,
  TILE_PRESSURE_PLATE, TILE_TELEPORTER, TILE_TRAP_HIDDEN, TILE_SWITCH,
} from '../types'
import type { LevelData } from '../types'

const W = TILE_WALL
const F = TILE_FLOOR
const D = TILE_DOOR_CLOSED
const P = TILE_PIT
const SD = TILE_SECRET_DOOR
const SU = TILE_STAIRS_UP
const SDN = TILE_STAIRS_DOWN
const PP = TILE_PRESSURE_PLATE
const TP = TILE_TELEPORTER
const TR = TILE_TRAP_HIDDEN
const SW = TILE_SWITCH

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
    [W,F,F,PP,F,D,F,F,F,F,F,W],
    [W,F,F,F,F,W,F,TR,F,F,F,W],
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
  trapConfig: {
    '7,4': { damageAmount: 3, logMessage: 'A poison dart shoots from the wall! You take 3 damage!' },
  },
  triggerLinks: [
    { triggerX: 3, triggerY: 3, triggerType: 'pressure_plate', action: 'open_door', targetX: 5, targetY: 3 },
  ],
  npcs: [
    {
      id: 'decimus',
      name: 'Priest Decimus',
      tileX: 2,
      tileY: 4,
      color: '#44aa44',
      dialogueStartNodeId: 'start',
      dialogueNodes: {
        start: {
          id: 'start',
          text: 'Hello, children. I am Decimus, a priest of the Light. The catacombs below are crawling with undead. How can I help you?',
          choices: [
            { text: 'We are wounded, holy father. Can you heal us?', nextNodeId: 'heal', action: 'heal_party' },
            { text: 'Tell us about this place.', nextNodeId: 'info' },
            { text: 'Goodbye.', nextNodeId: null }
          ]
        },
        heal: {
          id: 'heal',
          text: 'May the Light restore your health and shield your spirit.',
          choices: [
            { text: 'Thank you, father.', nextNodeId: null }
          ]
        },
        info: {
          id: 'info',
          text: 'These tombs were once sacred, but a dark power has infested them. Watch your step, traps are hidden everywhere, and pressure plates can trigger doors. Find the stairs down to seek the source of the curse.',
          choices: [
            { text: 'Thank you for the warning.', nextNodeId: 'start' }
          ]
        }
      }
    },
    {
      id: 'kaelen',
      name: 'Merchant Kaelen',
      tileX: 1,
      tileY: 1,
      color: '#4444cc',
      dialogueStartNodeId: 'start',
      shopItems: ['healing-potion', 'healing-potion', 'mana-potion', 'short-sword', 'leather-armor', 'shield'],
      dialogueNodes: {
        start: {
          id: 'start',
          text: "Aha, travelers! Name's Kaelen. I buy and sell weapons, armor, and gear. Care to do business?",
          choices: [
            { text: 'Show me your wares.', nextNodeId: null, action: 'open_shop' },
            { text: 'What is a merchant doing down here?', nextNodeId: 'story' },
            { text: 'Goodbye.', nextNodeId: null }
          ]
        },
        story: {
          id: 'story',
          text: "Where there's danger, there's opportunity! Adventurers like you leave behind valuable items... and need to buy supplies. It's a gold mine down here, literally!",
          choices: [
            { text: "Let's trade, then.", nextNodeId: null, action: 'open_shop' },
            { text: 'I see. Let me think about it.', nextNodeId: 'start' }
          ]
        }
      }
    }
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
    [W,F,F,F,F,F,F,F,SU,F,F,W],
    [W,F,F,F,D,F,W,F,F,F,F,W],
    [W,F,F,F,F,F,W,F,F,F,F,W],
    [W,W,W,W,W,W,W,W,W,W,W,W],
    [W,P,W,F,F,F,F,F,F,F,F,W],
    [W,F,W,F,F,F,F,F,F,F,F,W],
    [W,F,W,F,F,F,D,F,F,F,F,W],
    [W,F,W,F,F,F,F,W,W,W,SW,W],
    [W,F,F,F,PP,F,F,W,TR,TP,F,W],
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
    { item: { id: 'mana-potion-1', name: 'Mana Potion', type: 'potion', weight: 0.5, description: 'Restores 10 MP', effects: { mpRestore: 10 }, consumable: true }, tileX: 3, tileY: 7 },
  ],
  transitions: [
    { tileX: 8, tileY: 2, targetLevelId: 'catacombs_1', targetPosition: { x: 8, y: 5 }, targetFacing: 0 },
  ],
  trapConfig: {
    '8,10': { damageAmount: 2, statusEffect: 'poison', statusDuration: 3, logMessage: 'A poison trap triggers! You take 2 damage and are poisoned!' },
  },
  triggerLinks: [
    { triggerX: 4, triggerY: 10, triggerType: 'pressure_plate', action: 'open_door', targetX: 5, targetY: 8 },
    { triggerX: 10, triggerY: 9, triggerType: 'switch', action: 'reveal_secret_door', targetX: 1, targetY: 8 },
  ],
  teleporters: {
    '9,10': { targetX: 2, targetY: 6, targetFacing: 0 },
  },
}
