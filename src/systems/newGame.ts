import type { PartyMember } from '../types'
import { useGameStore } from '../store'
import { level1, level2 } from '../map/sampleDungeon'

/**
 * Begin a fresh adventure with the given party: wipe any carryover progress
 * (inventory, gold, torch, fog, per-level state), register the starting
 * campaign, and drop the party into the first level.
 */
export function startNewGame(party: PartyMember[]) {
  const store = useGameStore.getState()

  useGameStore.setState({
    inventory: [],
    ammo: {},
    gold: 100,
    torchDuration: 300,
    maxTorchDuration: 300,
    isResting: false,
    restTimer: 0,
    activeStatusEffects: [],
    perLevelStates: {},
    combatState: 'idle',
    enemies: [],
    currentTargetEnemyId: null,
    defendingMemberIds: [],
    testMode: false,
    gameOver: false,
    deathSaveTimers: {},
    pendingLevelUps: [],
    log: ['Welcome to the dungeon.'],
  })

  store.setParty(party)
  store.registerLevel(level1)
  store.registerLevel(level2)
  store.changeLevel(level1.id, level1.startPosition, level1.startFacing)
}
