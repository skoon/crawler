import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'

let enemyIdCounter = 0

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

      const enemies = trigger.enemies.map((tmpl) => ({
        ...tmpl,
        id: `enemy-${enemyIdCounter++}`,
        tileX: x,
        tileY: y,
      }))

      state.startCombat(enemies)
    })

    return unsub
  }, [])
}
