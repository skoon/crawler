import type { PartyMember } from '../types'
import type { StatKey } from '../data/classDefinitions'
import { classDefs, STAT_KEYS } from '../data/classDefinitions'
import { getXpThreshold } from '../data/levelProgression'

export type RollMethod = '3d6' | '4d6-drop-lowest'

export interface StatRoll {
  total: number
  rolls: number[] // the individual dice; for 4d6-drop-lowest the dropped die is still shown
}

export type StatBlock = Record<StatKey, StatRoll>

export interface CreationChar {
  name: string
  classId: string
  stats: StatBlock
}

function d6(): number {
  return Math.floor(Math.random() * 6) + 1
}

/** Roll a single ability score using the chosen method. */
export function rollStat(method: RollMethod): StatRoll {
  if (method === '4d6-drop-lowest') {
    const rolls = [d6(), d6(), d6(), d6()].sort((a, b) => b - a)
    const total = rolls[0] + rolls[1] + rolls[2]
    return { total, rolls }
  }
  const rolls = [d6(), d6(), d6()]
  return { total: rolls[0] + rolls[1] + rolls[2], rolls }
}

export function rollAllStats(method: RollMethod): StatBlock {
  const block = {} as StatBlock
  for (const key of STAT_KEYS) block[key] = rollStat(method)
  return block
}

/** Standard ability modifier: floor((score - 10) / 2). */
export function statModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function deriveMaxHp(classId: string, con: number): number {
  const def = classDefs[classId]
  if (!def) return 1
  return Math.max(1, def.hitDie + statModifier(con))
}

/** Unarmored base AC from class plus DEX modifier (higher is better here). */
export function deriveBaseAc(classId: string, dex: number): number {
  const def = classDefs[classId]
  if (!def) return 10
  return def.baseAC + statModifier(dex)
}

export function deriveMaxMp(classId: string, scores: Record<StatKey, number>): number {
  const def = classDefs[classId]
  if (!def || !def.casting) return 0
  const mod = statModifier(scores[def.casting.stat])
  return Math.max(0, def.casting.base + Math.max(0, mod) * def.casting.per)
}

/** Build a fully-derived, ready-to-play PartyMember from creation choices. */
export function makePartyMember(id: string, name: string, classId: string, stats: StatBlock): PartyMember {
  const scores = {} as Record<StatKey, number>
  for (const key of STAT_KEYS) scores[key] = stats[key].total

  const def = classDefs[classId]
  const maxHp = deriveMaxHp(classId, scores.con)
  const maxMp = deriveMaxMp(classId, scores)
  const ac = deriveBaseAc(classId, scores.dex)

  return {
    id,
    name: name.trim() || def?.defaultName || 'Adventurer',
    class: classId,
    level: 1,
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    ac,
    str: scores.str,
    dex: scores.dex,
    con: scores.con,
    int: scores.int,
    wis: scores.wis,
    cha: scores.cha,
    xp: 0,
    xpToNextLevel: getXpThreshold(1),
    status: [],
    equipment: {},
  }
}

export interface PartyTemplate {
  id: string
  label: string
  description: string
  classes: [string, string, string, string]
}

export const partyTemplates: PartyTemplate[] = [
  { id: 'balanced', label: 'Balanced', description: 'Fighter, Mage, Cleric, Thief — the classic all-rounder.', classes: ['Fighter', 'Mage', 'Cleric', 'Thief'] },
  { id: 'brawlers', label: 'Brawlers', description: 'Two Fighters up front with Cleric support and a Thief.', classes: ['Fighter', 'Fighter', 'Cleric', 'Thief'] },
  { id: 'arcane', label: 'Arcane', description: 'Double Mage firepower behind a Cleric and Thief.', classes: ['Mage', 'Mage', 'Cleric', 'Thief'] },
  { id: 'skirmish', label: 'Skirmish', description: 'Fighter, two Thieves, and a Cleric — fast and tricky.', classes: ['Fighter', 'Thief', 'Thief', 'Cleric'] },
]

/** Roll a fresh set of 4 creation characters for a template. */
export function buildTemplateChars(template: PartyTemplate, method: RollMethod): CreationChar[] {
  return template.classes.map((classId) => ({
    name: classDefs[classId]?.defaultName ?? 'Adventurer',
    classId,
    stats: rollAllStats(method),
  }))
}
