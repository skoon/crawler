import { TILE_STAIRS_UP, TILE_STAIRS_DOWN } from '../../types'
import type { LevelData, LevelTransition } from '../../types'

export interface StairsTile {
  x: number
  y: number
  type: number // TILE_STAIRS_UP or TILE_STAIRS_DOWN
}

/** All stairs tiles painted on the level, in row-major order. */
export function listStairs(level: LevelData): StairsTile[] {
  const out: StairsTile[] = []
  for (let y = 0; y < level.tiles.length; y++) {
    const row = level.tiles[y]
    for (let x = 0; x < row.length; x++) {
      if (row[x] === TILE_STAIRS_UP || row[x] === TILE_STAIRS_DOWN) {
        out.push({ x, y, type: row[x] })
      }
    }
  }
  return out
}

/** The transition (if any) wired to the stairs tile at (x, y). */
export function getTransition(level: LevelData, x: number, y: number): LevelTransition | undefined {
  return level.transitions?.find((t) => t.tileX === x && t.tileY === y)
}

/** Add or replace the transition for its tile, returning a new LevelData. */
export function upsertTransition(level: LevelData, transition: LevelTransition): LevelData {
  const others = (level.transitions ?? []).filter(
    (t) => !(t.tileX === transition.tileX && t.tileY === transition.tileY),
  )
  return { ...level, transitions: [...others, transition] }
}

/** Remove the transition for the tile at (x, y), returning a new LevelData. */
export function removeTransition(level: LevelData, x: number, y: number): LevelData {
  const remaining = (level.transitions ?? []).filter((t) => !(t.tileX === x && t.tileY === y))
  return { ...level, transitions: remaining }
}
