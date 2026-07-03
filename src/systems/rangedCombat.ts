import { isOpaque, isDoor } from '../map/mapUtils'
import { TILE_SECRET_DOOR } from '../types'
import type { Enemy, Item, TilePosition } from '../types'

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

function rollDice(notation: string): number {
  const [count, sides] = notation.split('d').map(Number)
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }
  return total
}

const BASE_THAC0 = 19

/** DEX governs missile to-hit (AD&D-style). */
export function getDexToHitBonus(dex: number): number {
  if (dex >= 18) return 2
  if (dex >= 16) return 1
  if (dex <= 5) return -2
  if (dex <= 8) return -1
  return 0
}

/** A weapon is "ranged" if it declares a range and an ammo type. */
export function isRangedWeapon(item?: Item | null): boolean {
  return !!item && item.effects.range !== undefined && item.effects.ammoType !== undefined
}

/** Chebyshev distance in tiles — diagonal reach feels natural on a grid. */
export function tileDistance(a: TilePosition, b: TilePosition): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

export function enemyAt(enemies: Enemy[], x: number, y: number): Enemy | null {
  return enemies.find((e) => e.hp > 0 && e.tileX === x && e.tileY === y) ?? null
}

/**
 * Does a given tile block a shot passing over it?
 * Walls block; closed doors and unrevealed secret doors block; open doors and
 * revealed secret doors let the shot through.
 */
function tileBlocksShot(
  tile: number,
  x: number,
  y: number,
  doorStates: Record<string, boolean>,
  secretRevealed: Record<string, boolean>,
): boolean {
  if (isDoor(tile)) return !doorStates[`${x},${y}`]
  if (tile === TILE_SECRET_DOOR) return !secretRevealed[`${x},${y}`]
  return isOpaque(tile)
}

/**
 * Line-of-sight between two tiles, sampling the straight line and rejecting if
 * any tile strictly between the endpoints blocks the shot.
 */
export function hasLineOfSight(
  map: number[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  doorStates: Record<string, boolean> = {},
  secretRevealed: Record<string, boolean> = {},
): boolean {
  const dx = x1 - x0
  const dy = y1 - y0
  const steps = Math.max(Math.abs(dx), Math.abs(dy))
  if (steps === 0) return true

  for (let s = 1; s < steps; s++) {
    const t = s / steps
    const ix = Math.round(x0 + dx * t)
    const iy = Math.round(y0 + dy * t)
    if (ix === x1 && iy === y1) continue
    const tile = map[iy]?.[ix]
    if (tile === undefined) return false
    if (tileBlocksShot(tile, ix, iy, doorStates, secretRevealed)) return false
  }
  return true
}

/**
 * Resolve a ranged attack roll. Mirrors resolvePlayerAttack but uses DEX for
 * to-hit instead of STR, and DEX does not add to damage.
 */
export function resolveRangedAttack(
  attackerDex: number,
  targetAc: number,
  weaponDamageDice?: string,
  weaponDamageBonus?: number,
): { hit: boolean; damage: number } {
  const roll = rollD20() + getDexToHitBonus(attackerDex)
  const hit = roll >= BASE_THAC0 - targetAc
  const dice = weaponDamageDice || '1d4'
  const bonus = weaponDamageBonus ?? 0
  const damage = hit ? Math.max(1, rollDice(dice) + bonus) : 0
  return { hit, damage }
}
