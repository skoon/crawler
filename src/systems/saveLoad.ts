import { useGameStore } from '../store'

const SAVE_PREFIX = 'dungeon_save_'

export function saveGame(slot: number): boolean {
  try {
    const state = useGameStore.getState()
    const data = {
      party: state.party,
      playerPosition: state.playerPosition,
      playerFacing: state.playerFacing,
      log: state.log,
      enemies: state.enemies,
      doorStates: state.doorStates,
      secretDoorsRevealed: state.secretDoorsRevealed,
      exploredTiles: state.exploredTiles,
      mapItems: state.mapItems,
      inventory: state.inventory,
      encounterTriggers: state.encounterTriggers,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(data))
    state.addLogMessage(`Game saved to slot ${slot}.`)
    return true
  } catch {
    return false
  }
}

export function loadGame(slot: number): boolean {
  try {
    const raw = localStorage.getItem(`${SAVE_PREFIX}${slot}`)
    if (!raw) return false
    const data = JSON.parse(raw)
    useGameStore.setState({
      party: data.party,
      playerPosition: data.playerPosition,
      playerFacing: data.playerFacing,
      log: [...data.log, `Game loaded from slot ${slot}.`],
      enemies: data.enemies ?? [],
      combatState: 'idle' as const,
      currentTargetEnemyId: null,
      defendingMemberIds: [],
      doorStates: data.doorStates ?? {},
      secretDoorsRevealed: data.secretDoorsRevealed ?? {},
      exploredTiles: data.exploredTiles ?? {},
      mapItems: data.mapItems ?? [],
      inventory: data.inventory ?? [],
      encounterTriggers: data.encounterTriggers ?? [],
    })
    return true
  } catch {
    return false
  }
}

export function getSaveSlots(): { slot: number; timestamp: string }[] {
  const slots: { slot: number; timestamp: string }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(SAVE_PREFIX)) {
      const slot = parseInt(key.slice(SAVE_PREFIX.length), 10)
      try {
        const data = JSON.parse(localStorage.getItem(key)!)
        slots.push({ slot, timestamp: data.timestamp ?? 'unknown' })
      } catch {
        slots.push({ slot, timestamp: 'corrupted' })
      }
    }
  }
  return slots.sort((a, b) => a.slot - b.slot)
}
