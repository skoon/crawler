import { create } from 'zustand'
import type { GameState, PartyMember, EquipSlot } from './types'
import { sampleDungeon, sampleEncounters, sampleMapItems } from './map/sampleDungeon'
import { isOpaque } from './map/mapUtils'

const party: PartyMember[] = [
  { id: '1', name: 'Aldric', class: 'Fighter', level: 1, hp: 12, maxHp: 12, ac: 18, str: 16, dex: 12, con: 14, int: 10, wis: 8, cha: 11, xp: 0, status: [], equipment: {} },
  { id: '2', name: 'Elara', class: 'Mage', level: 1, hp: 6, maxHp: 6, ac: 10, str: 8, dex: 10, con: 10, int: 17, wis: 14, cha: 12, xp: 0, status: [], equipment: {} },
  { id: '3', name: 'Brother Malek', class: 'Cleric', level: 1, hp: 10, maxHp: 10, ac: 16, str: 12, dex: 10, con: 12, int: 12, wis: 16, cha: 14, xp: 0, status: [], equipment: {} },
  { id: '4', name: 'Shadow', class: 'Thief', level: 1, hp: 8, maxHp: 8, ac: 14, str: 10, dex: 16, con: 10, int: 13, wis: 10, cha: 9, xp: 0, status: [], equipment: {} },
]

export const useGameStore = create<GameState>((set, get) => ({
  party,
  selectedMemberIndex: 0,
  playerPosition: sampleDungeon.startPosition,
  playerFacing: sampleDungeon.startFacing,
  dungeonMap: sampleDungeon.tiles,
  log: ['Welcome to the dungeon.'],
  combatState: 'idle' as const,
  enemies: [],
  encounterTriggers: sampleEncounters,
  currentTargetEnemyId: null,
  defendingMemberIds: [],
  doorStates: {},
  secretDoorsRevealed: {},
  exploredTiles: {},
  mapItems: sampleMapItems,
  inventory: [],

  selectMember: (index) => set({ selectedMemberIndex: index }),
  addLogMessage: (message) => set((state) => ({ log: [...state.log, message] })),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerFacing: (facing) => set({ playerFacing: facing }),

  startCombat: (enemies) => {
    const names = enemies.map((e) => e.name).join(', ')
    set({ combatState: 'playerTurn', enemies, currentTargetEnemyId: null, log: [...get().log, `Ambush! ${names} appear!`] })
  },

  endCombat: () => set({ combatState: 'idle', enemies: [], currentTargetEnemyId: null, defendingMemberIds: [] }),

  setCombatState: (state) => set({ combatState: state }),

  setCurrentTargetEnemyId: (id) => set({ currentTargetEnemyId: id }),

  damageEnemy: (id, amount) => set((state) => ({
    enemies: state.enemies.map((e) =>
      e.id === id ? { ...e, hp: Math.max(0, e.hp - amount) } : e
    ),
  })),

  damageMember: (index, amount) => set((state) => ({
    party: state.party.map((m, i) =>
      i === index ? { ...m, hp: Math.max(0, m.hp - amount) } : m
    ),
  })),

  setDefending: (memberIndex, defending) => set((state) => ({
    defendingMemberIds: defending
      ? [...state.defendingMemberIds, memberIndex.toString()]
      : state.defendingMemberIds.filter((id) => id !== memberIndex.toString()),
  })),

  moveEnemy: (id, x, y) => set((state) => ({
    enemies: state.enemies.map((e) =>
      e.id === id ? { ...e, tileX: x, tileY: y } : e
    ),
  })),

  toggleDoor: (x, y) => set((state) => {
    const key = `${x},${y}`
    const open = state.doorStates[key]
    return {
      doorStates: { ...state.doorStates, [key]: !open },
      log: [...state.log, `Door ${open ? 'closes' : 'opens'}.`],
    }
  }),

  revealSecretDoor: (x, y) => set((state) => ({
    secretDoorsRevealed: { ...state.secretDoorsRevealed, [`${x},${y}`]: true },
    log: [...state.log, 'You found a secret door!'],
  })),

  exploreTile: (x, y) => set((state) => ({
    exploredTiles: { ...state.exploredTiles, [`${x},${y}`]: true },
  })),

  exploreRadius: (centerX, centerY, radius) => set((state) => {
    const newExplored = { ...state.exploredTiles }
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > radius) continue
        const tx = centerX + dx
        const ty = centerY + dy
        if (ty < 0 || ty >= state.dungeonMap.length || tx < 0 || tx >= state.dungeonMap[0].length) continue

        // Simple line-of-sight: check if any intermediate tile is opaque
        let blocked = false
        const steps = Math.max(Math.abs(dx), Math.abs(dy))
        for (let s = 0; s <= steps; s++) {
          const t = steps > 0 ? s / steps : 0
          const ix = Math.round(centerX + dx * t)
          const iy = Math.round(centerY + dy * t)
          if (ix === centerX && iy === centerY) continue
          if (ix === tx && iy === ty) continue
          const tile = state.dungeonMap[iy]?.[ix]
          if (tile !== undefined) {
            if (isOpaque(tile)) { blocked = true; break }
          }
        }

        if (!blocked) {
          newExplored[`${tx},${ty}`] = true
        }
      }
    }
    return { exploredTiles: newExplored }
  }),

  pickupItem: (tileX, tileY) => set((state) => {
    const idx = state.mapItems.findIndex((mi) => mi.tileX === tileX && mi.tileY === tileY)
    if (idx === -1) return state
    const mi = state.mapItems[idx]
    return {
      mapItems: state.mapItems.filter((_, i) => i !== idx),
      inventory: [...state.inventory, mi.item],
      log: [...state.log, `Picked up ${mi.item.name}.`],
    }
  }),

  removeMapItem: (tileX, tileY) => set((state) => ({
    mapItems: state.mapItems.filter((mi) => !(mi.tileX === tileX && mi.tileY === tileY)),
  })),

  addToInventory: (item) => set((state) => ({
    inventory: [...state.inventory, item],
  })),

  equipItem: (memberIndex, slot, item) => set((state) => {
    const member = state.party[memberIndex]
    if (!member) return state
    const oldItem = member.equipment[slot]
    const newInventory = state.inventory.filter((i) => i.id !== item.id)
    if (oldItem) newInventory.push(oldItem)
    return {
      party: state.party.map((m, i) =>
        i === memberIndex ? { ...m, equipment: { ...m.equipment, [slot]: item } } : m
      ),
      inventory: newInventory,
      log: [...state.log, `${member.name} equips ${item.name}.`],
    }
  }),

  unequipItem: (memberIndex, slot) => set((state) => {
    const member = state.party[memberIndex]
    if (!member) return state
    const item = member.equipment[slot]
    if (!item) return state
    const newEquipment = { ...member.equipment }
    delete newEquipment[slot]
    return {
      party: state.party.map((m, i) =>
        i === memberIndex ? { ...m, equipment: newEquipment } : m
      ),
      inventory: [...state.inventory, item],
      log: [...state.log, `${member.name} unequips ${item.name}.`],
    }
  }),

  useItem: (itemId, memberIndex) => set((state) => {
    const item = state.inventory.find((i) => i.id === itemId)
    if (!item || !item.consumable) return state
    const member = state.party[memberIndex]
    if (!member || member.hp <= 0) return state

    let logMsg = `${member.name} uses ${item.name}.`
    let newParty = state.party

    if (item.type === 'potion' && item.effects.hpBonus !== undefined) {
      // Healing potion: roll 2d4
      const heal = Array.from({ length: 2 }, () => Math.floor(Math.random() * 4) + 1).reduce((a, b) => a + b, 0)
      const newHp = Math.min(member.maxHp, member.hp + heal)
      const actualHeal = newHp - member.hp
      logMsg = `${member.name} drinks ${item.name} and heals ${actualHeal} HP.`
      newParty = state.party.map((m, i) =>
        i === memberIndex ? { ...m, hp: newHp } : m
      )
    }

    return {
      party: newParty,
      inventory: state.inventory.filter((i) => i.id !== itemId),
      log: [...state.log, logMsg],
    }
  }),

  loadLevel: (level) => set({
    dungeonMap: level.tiles,
    playerPosition: level.startPosition,
    playerFacing: level.startFacing,
    encounterTriggers: level.encounters,
    mapItems: level.items,
    floorTexture: level.floorTexture,
    wallTexture: level.wallTexture,
    combatState: 'idle',
    enemies: [],
    doorStates: {},
    secretDoorsRevealed: {},
    exploredTiles: {},
    currentTargetEnemyId: null,
    defendingMemberIds: [],
  }),
}))
