import { classDefs } from './classDefinitions'

/**
 * Total cumulative XP a member needs to advance FROM `level` to `level + 1`.
 * Kept modest so progression is reachable within the short built-in campaign
 * (enemies award ~15–50 XP each).
 */
export function getXpThreshold(level: number): number {
  return level * 100
}

/** Standard D&D ability modifier: floor((stat - 10) / 2). */
export function getStatModifier(stat: number): number {
  return Math.floor((stat - 10) / 2)
}

/** Roll a single hit die for the class (1..hitDie). Unknown classes roll a d6. */
export function rollHitPoints(classId: string): number {
  const die = classDefs[classId]?.hitDie ?? 6
  return Math.floor(Math.random() * die) + 1
}

export interface LevelUpResult {
  memberId: string
  name: string
  newLevel: number
  hpGained: number
  mpGained: number
}
