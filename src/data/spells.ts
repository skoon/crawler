import type { Spell } from '../types'

export const spells: Spell[] = [
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    description: 'Auto-hit for 1d4+1 damage',
    mpCost: 5,
    targetType: 'enemy',
    allowedClasses: ['Mage'],
  },
  {
    id: 'fireball',
    name: 'Fireball',
    description: '2d6 damage to all enemies (DEX half)',
    mpCost: 12,
    targetType: 'all_enemies',
    allowedClasses: ['Mage'],
  },
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restores 2d6+2 HP to an ally',
    mpCost: 8,
    targetType: 'ally',
    allowedClasses: ['Cleric'],
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Paralyzes one enemy for 1d3 rounds',
    mpCost: 6,
    targetType: 'enemy',
    allowedClasses: ['Mage'],
  },
  {
    id: 'haste',
    name: 'Haste',
    description: 'Ally gets +1 attack per turn for 3 rounds',
    mpCost: 10,
    targetType: 'ally',
    allowedClasses: ['Mage'],
  },
  {
    id: 'shield',
    name: 'Shield',
    description: '+4 AC bonus for 3 rounds',
    mpCost: 4,
    targetType: 'ally',
    allowedClasses: ['Mage', 'Cleric'],
  },
]

export const spellsById = Object.fromEntries(spells.map((s) => [s.id, s]))
