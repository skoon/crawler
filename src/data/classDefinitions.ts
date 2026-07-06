export type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export const STAT_KEYS: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
export const STAT_LABELS: Record<StatKey, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
}

export interface ClassDef {
  id: string
  name: string
  description: string
  hitDie: number // max value of the hit die (d10 -> 10); level-1 HP is this + CON mod
  baseAC: number // unarmored AC before DEX; higher is better in this game
  primeStat: StatKey
  /** How the class draws MP: from which mental stat, and a base. 'none' = no casting. */
  casting: { stat: StatKey; base: number; per: number } | null
  defaultName: string
  portraitColor: string
}

export const classDefs: Record<string, ClassDef> = {
  Fighter: {
    id: 'Fighter',
    name: 'Fighter',
    description: 'A hardy front-line warrior. Best HP, heavy armor, no magic.',
    hitDie: 10,
    baseAC: 16,
    primeStat: 'str',
    casting: null,
    defaultName: 'Aldric',
    portraitColor: '#c44',
  },
  Paladin: {
    id: 'Paladin',
    name: 'Paladin',
    description: 'A holy warrior — Fighter durability with a sliver of divine power.',
    hitDie: 10,
    baseAC: 16,
    primeStat: 'str',
    casting: { stat: 'wis', base: 0, per: 2 },
    defaultName: 'Seraphine',
    portraitColor: '#cc8',
  },
  Ranger: {
    id: 'Ranger',
    name: 'Ranger',
    description: 'A nimble hunter — strong with bows and quick on their feet.',
    hitDie: 8,
    baseAC: 13,
    primeStat: 'dex',
    casting: null,
    defaultName: 'Kael',
    portraitColor: '#4a4',
  },
  Cleric: {
    id: 'Cleric',
    name: 'Cleric',
    description: 'A divine healer. Solid armor and restorative magic (WIS).',
    hitDie: 8,
    baseAC: 14,
    primeStat: 'wis',
    casting: { stat: 'wis', base: 3, per: 4 },
    defaultName: 'Malek',
    portraitColor: '#c84',
  },
  Thief: {
    id: 'Thief',
    name: 'Thief',
    description: 'A sly rogue — light on defense but deadly and dexterous.',
    hitDie: 6,
    baseAC: 12,
    primeStat: 'dex',
    casting: null,
    defaultName: 'Shadow',
    portraitColor: '#484',
  },
  Mage: {
    id: 'Mage',
    name: 'Mage',
    description: 'A frail but powerful arcane caster. Best spells (INT), worst HP/AC.',
    hitDie: 6,
    baseAC: 10,
    primeStat: 'int',
    casting: { stat: 'int', base: 8, per: 4 },
    defaultName: 'Elara',
    portraitColor: '#44c',
  },
}

export const CLASS_IDS = Object.keys(classDefs)
