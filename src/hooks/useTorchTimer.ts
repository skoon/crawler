import { useEffect } from 'react'
import { useGameStore } from '../store'
import type { Enemy } from '../types'

const TICK_MS = 1000
const TICK_SECONDS = TICK_MS / 1000

// Chance per second that resting is interrupted by wandering monsters.
const REST_ENCOUNTER_CHANCE = 0.06

const WANDERING_MONSTERS: Omit<Enemy, 'id' | 'tileX' | 'tileY'>[] = [
  { name: 'Goblin', hp: 6, maxHp: 6, ac: 13, thac0: 19, damage: '1d6', damageBonus: 0, xp: 15 },
  { name: 'Skeleton', hp: 8, maxHp: 8, ac: 14, thac0: 18, damage: '1d8', damageBonus: 0, xp: 25 },
]

function rollWanderingEncounter() {
  const state = useGameStore.getState()
  const template = WANDERING_MONSTERS[Math.floor(Math.random() * WANDERING_MONSTERS.length)]
  const enemy: Enemy = {
    ...template,
    id: `wander-${Date.now()}`,
    tileX: state.playerPosition.x,
    tileY: state.playerPosition.y,
  }
  state.stopRest()
  state.addLogMessage('Wandering monsters stumble upon your camp!')
  state.startCombat([enemy])
}

/**
 * Drives the real-time torch countdown and the resting recovery loop.
 * Runs on a 1s interval (the hook lives outside the R3F <Canvas>, so useFrame
 * isn't available here — this matches the movement/fog systems' interval pattern).
 */
export function useTorchTimer(isPaused: boolean = false) {
  useEffect(() => {
    const id = setInterval(() => {
      if (isPaused) return

      const state = useGameStore.getState()

      // Gameplay is suspended during dialogue/shopping and turn-based combat.
      if (state.activeNpcId !== null || state.showShop || state.combatState !== 'idle') return

      if (state.isResting) {
        state.tickRest(TICK_SECONDS)
        // A fresh read: tickRest may have auto-ended the rest once fully recovered.
        if (useGameStore.getState().isResting && Math.random() < REST_ENCOUNTER_CHANCE) {
          rollWanderingEncounter()
          return
        }
      }

      // The torch burns whether you explore or rest by its light.
      state.tickTorch(TICK_SECONDS)
    }, TICK_MS)

    return () => clearInterval(id)
  }, [isPaused])
}
