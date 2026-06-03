import { useGameStore } from '../store'
import type { MapTrigger } from '../types'

function rollDice(notation: string): number {
  const [count, sides] = notation.split('d').map(Number)
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }
  return total
}

function executeTriggerEffect(trigger: MapTrigger): void {
  const state = useGameStore.getState()

  switch (trigger.type) {
    case 'trap': {
      const dmg = trigger.damageDice ? rollDice(trigger.damageDice) : 2
      // Damage the first alive party member
      const targetIdx = state.party.findIndex((m) => m.hp > 0)
      if (targetIdx >= 0) {
        state.damageMember(targetIdx, dmg)
        const msg = trigger.triggerMessage ?? `You take ${dmg} damage from a trap!`
        state.addLogMessage(`${msg} (${dmg} damage)`)
      }
      break
    }

    case 'teleporter': {
      if (trigger.teleportTargetX !== undefined && trigger.teleportTargetY !== undefined) {
        state.setPlayerPosition({ x: trigger.teleportTargetX, y: trigger.teleportTargetY })
        if (trigger.triggerMessage) {
          state.addLogMessage(trigger.triggerMessage)
        }
      }
      break
    }

    case 'switch': {
      if (trigger.triggersEffect && trigger.triggersTileX !== undefined && trigger.triggersTileY !== undefined) {
        const tx = trigger.triggersTileX
        const ty = trigger.triggersTileY

        switch (trigger.triggersEffect) {
          case 'reveal_secret':
            state.revealSecretDoor(tx, ty)
            break
          case 'toggle_door':
            state.toggleDoor(tx, ty)
            break
        }

        if (trigger.triggerMessage) {
          state.addLogMessage(trigger.triggerMessage)
        }
      }
      break
    }

    case 'pressure_plate': {
      if (trigger.triggersEffect && trigger.triggersTileX !== undefined && trigger.triggersTileY !== undefined) {
        const tx = trigger.triggersTileX
        const ty = trigger.triggersTileY

        switch (trigger.triggersEffect) {
          case 'reveal_secret':
            state.revealSecretDoor(tx, ty)
            break
          case 'toggle_door':
            state.toggleDoor(tx, ty)
            break
        }

        if (trigger.triggerMessage) {
          state.addLogMessage(trigger.triggerMessage)
        }
      }
      break
    }
  }
}

export function getStepTriggers(x: number, y: number): MapTrigger[] {
  const state = useGameStore.getState()
  return state.mapTriggers.filter((t) => {
    if (t.tileX !== x || t.tileY !== y) return false
    if (t.type === 'switch') return false
    if (!t.repeatable && state.triggeredStates[t.id]) return false
    return true
  })
}

export function getInteractTriggers(x: number, y: number): MapTrigger[] {
  const state = useGameStore.getState()
  return state.mapTriggers.filter((t) => {
    if (t.tileX !== x || t.tileY !== y) return false
    if (t.type !== 'switch') return false
    if (!t.repeatable && state.triggeredStates[t.id]) return false
    return true
  })
}

export function activateTrigger(trigger: MapTrigger): void {
  const state = useGameStore.getState()
  executeTriggerEffect(trigger)
  state.activateTrigger(trigger.id)
}

export function useStepTriggers(): void {
  const playerPosition = useGameStore((s) => s.playerPosition)
  // This is called by the movement system after position changes
  // We trigger via checkStepTriggers() exported below
}

export function checkStepTriggers(): void {
  const state = useGameStore.getState()
  const triggers = getStepTriggers(state.playerPosition.x, state.playerPosition.y)
  for (const trigger of triggers) {
    activateTrigger(trigger)
  }
}
