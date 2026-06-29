import type { Item } from '../types'

export const itemTemplates: Record<string, Item> = {
  'healing-potion': {
    id: 'healing-potion',
    name: 'Healing Potion',
    type: 'potion',
    weight: 0.5,
    description: 'Restores 2d4 HP',
    effects: { hpBonus: 1 },
    consumable: true,
  },
  'mana-potion': {
    id: 'mana-potion',
    name: 'Mana Potion',
    type: 'potion',
    weight: 0.5,
    description: 'Restores 10 MP',
    effects: { mpRestore: 10 },
    consumable: true,
  },
  'short-sword': {
    id: 'short-sword',
    name: 'Short Sword',
    type: 'weapon',
    weight: 3,
    description: 'A sharp iron blade (1d6 damage)',
    effects: { damageDice: '1d6', damageBonus: 0 },
    consumable: false,
  },
  'leather-armor': {
    id: 'leather-armor',
    name: 'Leather Armor',
    type: 'armor',
    weight: 10,
    description: 'Hardened leather protection (+2 AC)',
    effects: { acBonus: 2 },
    consumable: false,
  },
  'shield': {
    id: 'wooden-shield',
    name: 'Wooden Shield',
    type: 'shield',
    weight: 5,
    description: 'A round wooden shield (+1 AC)',
    effects: { acBonus: 1 },
    consumable: false,
  },
}
