import { useEffect } from 'react'
import { useGameStore } from '../store'

/** Visibility radius shrinks as the torch burns down. */
export function torchVisibilityRadius(torchDuration: number, maxTorchDuration: number): number {
  const ratio = maxTorchDuration > 0 ? torchDuration / maxTorchDuration : 0
  if (torchDuration <= 0) return 1
  if (ratio < 0.3) return 3
  if (ratio < 0.6) return 4
  return 5
}

export function useFogOfWar() {
  useEffect(() => {
    const reveal = (x: number, y: number) => {
      const state = useGameStore.getState()
      const radius = torchVisibilityRadius(state.torchDuration, state.maxTorchDuration)
      state.exploreRadius(x, y, radius)
    }

    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.playerPosition === prev.playerPosition) return
      reveal(state.playerPosition.x, state.playerPosition.y)
    })

    // Explore starting position
    const start = useGameStore.getState().playerPosition
    reveal(start.x, start.y)

    return unsub
  }, [])
}
