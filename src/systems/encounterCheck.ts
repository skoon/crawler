import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'
import { getTile, isWalkable } from '../map/mapUtils'

let enemyIdCounter = 0

const FACING_DIRS: Record<number, { x: number; y: number }> = {
  0: { x: 0, y: -1 }, // North
  1: { x: 1, y: 0 },  // East
  2: { x: 0, y: 1 },  // South
  3: { x: -1, y: 0 }, // West
}

/**
 * Find a walkable tile up to `dist` steps ahead of the party. Stops early at a
 * wall so enemies spawn with some separation (giving ranged combat a purpose)
 * without ever landing inside geometry. Falls back to the party's tile.
 */
function forwardSpawn(map: number[][], px: number, py: number, facing: number, dist: number): { x: number; y: number } {
  const dir = FACING_DIRS[facing] ?? FACING_DIRS[0]
  let cx = px
  let cy = py
  for (let step = 1; step <= dist; step++) {
    const nx = px + dir.x * step
    const ny = py + dir.y * step
    if (!isWalkable(getTile(map, nx, ny))) break
    cx = nx
    cy = ny
  }
  return { x: cx, y: cy }
}

export function useEncounterCheck() {
  const checked = useRef(new Set<string>())

  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.playerPosition === prev.playerPosition) return
      if (state.combatState !== 'idle') return

      const { x, y } = state.playerPosition
      const trigger = state.encounterTriggers.find((t) => t.x === x && t.y === y)
      if (!trigger) return

      const key = `${x},${y}`
      if (checked.current.has(key)) return
      checked.current.add(key)

      const taken = new Set<string>()
      const enemies = trigger.enemies.map((tmpl, i) => {
        // Line them up ahead of the party; nearer enemies stack behind the lead.
        let spawn = forwardSpawn(state.dungeonMap, x, y, state.playerFacing, Math.max(1, 3 - i))
        if (taken.has(`${spawn.x},${spawn.y}`)) spawn = { x, y }
        taken.add(`${spawn.x},${spawn.y}`)
        return {
          ...tmpl,
          id: `enemy-${enemyIdCounter++}`,
          tileX: spawn.x,
          tileY: spawn.y,
        }
      })

      state.startCombat(enemies)
    })

    return unsub
  }, [])
}
