import { useEffect } from 'react'
import { useGameStore } from '../store'

const VISIBILITY_RADIUS = 5

export function useFogOfWar() {
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.playerPosition === prev.playerPosition) return
      state.exploreRadius(state.playerPosition.x, state.playerPosition.y, VISIBILITY_RADIUS)
    })

    // Explore starting position
    const state = useGameStore.getState()
    state.exploreRadius(state.playerPosition.x, state.playerPosition.y, VISIBILITY_RADIUS)

    return unsub
  }, [])
}
