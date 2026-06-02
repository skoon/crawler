import { useGameStore } from '../store'
import type { PartyMember, Enemy, StatusEffect } from '../types'

let effectCounter = 0

export function createStatusEffect(
  type: StatusEffect['type'],
  targetId: string,
  targetType: 'enemy' | 'party_member',
  duration: number,
): StatusEffect {
  const names: Record<StatusEffect['type'], string> = {
    poison: 'Poison',
    paralysis: 'Paralysis',
    burn: 'Burn',
    sleep: 'Sleep',
    haste: 'Haste',
    shield: 'Shield',
  }
  effectCounter++
  return {
    id: `status-${effectCounter}-${Date.now()}`,
    name: names[type],
    targetId,
    targetType,
    duration,
    type,
  }
}

export function isAffectedBy(
  effects: StatusEffect[],
  targetId: string,
  type: StatusEffect['type'],
): boolean {
  return effects.some((e) => e.targetId === targetId && e.type === type && e.duration > 0)
}

export function processStatusEffects(): string[] {
  const state = useGameStore.getState()
  const messages: string[] = []
  const remaining: StatusEffect[] = []

  for (const effect of state.activeStatusEffects) {
    if (effect.duration <= 0) continue

    const newDuration = effect.duration - 1

    // Apply damage-over-time effects
    if (effect.type === 'poison') {
      const dmg = Math.floor(Math.random() * 4) + 1
      if (effect.targetType === 'party_member') {
        const idx = state.party.findIndex((m) => m.id === effect.targetId)
        if (idx >= 0) {
          state.damageMember(idx, dmg)
          messages.push(`${state.party[idx].name} takes ${dmg} poison damage.`)
        }
      } else {
        const enemy = state.enemies.find((e) => e.id === effect.targetId)
        if (enemy && enemy.hp > 0) {
          state.damageEnemy(effect.targetId, dmg)
          messages.push(`${enemy.name} takes ${dmg} poison damage.`)
        }
      }
    }

    if (effect.type === 'burn') {
      const dmg = Math.floor(Math.random() * 6) + 1
      if (effect.targetType === 'party_member') {
        const idx = state.party.findIndex((m) => m.id === effect.targetId)
        if (idx >= 0) {
          state.damageMember(idx, dmg)
          messages.push(`${state.party[idx].name} takes ${dmg} burn damage.`)
        }
      } else {
        const enemy = state.enemies.find((e) => e.id === effect.targetId)
        if (enemy && enemy.hp > 0) {
          state.damageEnemy(effect.targetId, dmg)
          messages.push(`${enemy.name} takes ${dmg} burn damage.`)
        }
      }
    }

    if (newDuration > 0) {
      remaining.push({ ...effect, duration: newDuration })
    } else {
      const name = effect.name.toLowerCase()
      messages.push(`${effect.name} on ${effect.targetId} has worn off.`)
    }
  }

  useGameStore.getState().addStatusEffect(remaining as any)
  // HACK: directly set via setState since addStatusEffect appends
  useGameStore.setState({ activeStatusEffects: remaining })

  return messages
}

export function getEffectiveAc(
  baseAc: number,
  effects: StatusEffect[],
  targetId: string,
): number {
  if (isAffectedBy(effects, targetId, 'shield')) {
    return baseAc + 4
  }
  return baseAc
}

export function canAct(
  effects: StatusEffect[],
  targetId: string,
): boolean {
  if (isAffectedBy(effects, targetId, 'paralysis')) return false
  if (isAffectedBy(effects, targetId, 'sleep')) return false
  return true
}

export function getAttackMultiplier(
  effects: StatusEffect[],
  targetId: string,
): number {
  if (isAffectedBy(effects, targetId, 'haste')) return 2
  return 1
}
