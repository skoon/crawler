import { useEffect } from 'react'
import { useGameStore } from '../store'
import { getTile } from '../map/mapUtils'
import { TILE_SECRET_DOOR } from '../types'

export function useSecretDoorDetect() {
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.playerPosition === prev.playerPosition) return
      if (state.combatState !== 'idle') return

      const { x, y } = state.playerPosition
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ]

      for (const d of dirs) {
        const nx = x + d.dx
        const ny = y + d.dy
        const key = `${nx},${ny}`
        if (state.secretDoorsRevealed[key]) continue
        const tile = getTile(state.dungeonMap, nx, ny)
        if (tile === TILE_SECRET_DOOR) {
          state.revealSecretDoor(nx, ny)
        }
      }
    })

    return unsub
  }, [])
}
