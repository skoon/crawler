import { useEffect } from 'react'
import { useGameStore } from '../store'
import { TILE_TRAP_HIDDEN, TILE_PRESSURE_PLATE, TILE_TELEPORTER } from '../types'
import { createStatusEffect } from './statusEffects'

export function useTrapSystem() {
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.playerPosition === prev.playerPosition) return
      if (state.combatState !== 'idle') return

      const { x, y } = state.playerPosition
      const tile = state.dungeonMap[y]?.[x]
      if (tile === undefined) return

      const currentLevel = state.levels[state.currentLevelId]

      if (tile === TILE_TRAP_HIDDEN) {
        const trap = currentLevel?.trapConfig?.[`${x},${y}`]
        if (trap) {
          const fresh = useGameStore.getState()
          fresh.addLogMessage(trap.logMessage)
          fresh.damagePartyAll(trap.damageAmount)
          if (trap.statusEffect) {
            const effectType = trap.statusEffect as any
            for (const member of fresh.party) {
              if (member.hp > 0) {
                const effect = createStatusEffect(effectType, member.id, 'party_member', trap.statusDuration ?? 3)
                fresh.addStatusEffect(effect)
              }
            }
          }
        } else {
          const fresh = useGameStore.getState()
          fresh.addLogMessage('A trap triggers! You take 2 damage!')
          fresh.damagePartyAll(2)
        }
      }

      if (tile === TILE_PRESSURE_PLATE) {
        const fresh = useGameStore.getState()
        fresh.activateTrigger(x, y)
      }

      if (tile === TILE_TELEPORTER) {
        const dest = currentLevel?.teleporters?.[`${x},${y}`]
        if (dest) {
          const fresh = useGameStore.getState()
          fresh.addLogMessage('You are teleported!')
          fresh.setPlayerPosition({ x: dest.targetX, y: dest.targetY })
          fresh.setPlayerFacing(dest.targetFacing)
        }
      }
    })

    return unsub
  }, [])
}
