import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'

export function useItemPickup() {
  const lastPickupRef = useRef(0)

  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.playerPosition === prev.playerPosition) return
      if (state.combatState !== 'idle') return

      const now = Date.now()
      if (now - lastPickupRef.current < 500) return

      const { x, y } = state.playerPosition
      const item = state.mapItems.find((mi) => mi.tileX === x && mi.tileY === y)
      if (item) {
        lastPickupRef.current = now
        state.pickupItem(x, y)
      }
    })

    return unsub
  }, [])
}
