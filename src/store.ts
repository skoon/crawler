import { create } from 'zustand'
import type { GameState, PartyMember, LevelData, LevelScopedState } from './types'
import { level1, level2 } from './map/sampleDungeon'
import { isOpaque, isDoor } from './map/mapUtils'
import { itemTemplates } from './data/items'

const party: PartyMember[] = [
  { id: '1', name: 'Aldric', class: 'Fighter', level: 1, hp: 12, maxHp: 12, mp: 0, maxMp: 0, ac: 18, str: 16, dex: 12, con: 14, int: 10, wis: 8, cha: 11, xp: 0, status: [], equipment: {} },
  { id: '2', name: 'Elara', class: 'Mage', level: 1, hp: 6, maxHp: 6, mp: 20, maxMp: 20, ac: 10, str: 8, dex: 10, con: 10, int: 17, wis: 14, cha: 12, xp: 0, status: [], equipment: {} },
  { id: '3', name: 'Brother Malek', class: 'Cleric', level: 1, hp: 10, maxHp: 10, mp: 15, maxMp: 15, ac: 16, str: 12, dex: 10, con: 12, int: 12, wis: 16, cha: 14, xp: 0, status: [], equipment: {} },
  { id: '4', name: 'Shadow', class: 'Thief', level: 1, hp: 8, maxHp: 8, mp: 0, maxMp: 0, ac: 14, str: 10, dex: 16, con: 10, int: 13, wis: 10, cha: 9, xp: 0, status: [], equipment: {} },
]

function buildLevelRegistry(): Record<string, LevelData> {
  const reg: Record<string, LevelData> = {}
  for (const lvl of [level1, level2]) {
    reg[lvl.id] = lvl
  }
  return reg
}

const levels = buildLevelRegistry()
const initialLevel = level1

export const useGameStore = create<GameState>((set, get) => ({
  party,
  selectedMemberIndex: 0,
  playerPosition: initialLevel.startPosition,
  playerFacing: initialLevel.startFacing,
  dungeonMap: initialLevel.tiles,
  floorTexture: initialLevel.floorTexture,
  wallTexture: initialLevel.wallTexture,
  log: ['Welcome to the dungeon.'],
  combatState: 'idle' as const,
  enemies: [],
  encounterTriggers: initialLevel.encounters,
  currentTargetEnemyId: null,
  defendingMemberIds: [],
  torchDuration: 300,
  maxTorchDuration: 300,
  isResting: false,
  restTimer: 0,
  doorStates: {},
  secretDoorsRevealed: {},
  exploredTiles: {},
  targetingMode: false,
  targetPosition: null,
  ammo: {},
  mapItems: initialLevel.items,
  inventory: [],
  activeStatusEffects: [],
  triggerStates: {},
  switchStates: {},
  currentLevelId: initialLevel.id,
  gold: 100,
  activeNpcId: null,
  currentDialogueNodeId: null,
  showShop: false,
  npcs: initialLevel.npcs ?? [],
  levels,
  perLevelStates: {},

  selectMember: (index) => set({ selectedMemberIndex: index }),
  addLogMessage: (message) => set((state) => ({ log: [...state.log, message] })),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerFacing: (facing) => set({ playerFacing: facing }),

  startCombat: (enemies) => {
    const names = enemies.map((e) => e.name).join(', ')
    set({ combatState: 'playerTurn', enemies, currentTargetEnemyId: null, log: [...get().log, `Ambush! ${names} appear!`] })
  },

  endCombat: () => set({ combatState: 'idle', enemies: [], currentTargetEnemyId: null, defendingMemberIds: [], targetingMode: false, targetPosition: null }),

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

  tickTorch: (deltaSeconds) => set((state) => {
    if (state.torchDuration <= 0) return state
    const next = Math.max(0, state.torchDuration - deltaSeconds)
    if (next === 0) {
      return { torchDuration: 0, log: [...state.log, 'Your torch sputters and dies. Darkness closes in!'] }
    }
    return { torchDuration: next }
  }),

  refillTorch: (seconds) => set((state) => ({
    torchDuration: Math.min(state.maxTorchDuration, state.torchDuration + seconds),
  })),

  startRest: () => set((state) => {
    if (state.isResting) return state
    return { isResting: true, restTimer: 0, log: [...state.log, 'You make camp and settle down to rest...'] }
  }),

  stopRest: () => set((state) => {
    if (!state.isResting) return state
    return { isResting: false, restTimer: 0, log: [...state.log, 'You break camp and press on.'] }
  }),

  tickRest: (deltaSeconds) => set((state) => {
    if (!state.isResting) return state
    const prevTimer = state.restTimer
    const nextTimer = prevTimer + deltaSeconds
    // Recover 1 HP / 1 MP per 2 seconds rested.
    const healSteps = Math.floor(nextTimer / 2) - Math.floor(prevTimer / 2)
    if (healSteps <= 0) return { restTimer: nextTimer }

    let anyRecovered = false
    const party = state.party.map((m) => {
      if (m.hp <= 0) return m // the unconscious don't recover by resting
      const newHp = Math.min(m.maxHp, m.hp + healSteps)
      const newMp = Math.min(m.maxMp, m.mp + healSteps)
      if (newHp !== m.hp || newMp !== m.mp) anyRecovered = true
      return { ...m, hp: newHp, mp: newMp }
    })

    if (!anyRecovered) {
      // Everyone is topped off — no reason to keep resting.
      return { isResting: false, restTimer: 0, party, log: [...state.log, 'The party is fully rested.'] }
    }
    return { restTimer: nextTimer, party }
  }),

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

  setTargetingMode: (active) => set({ targetingMode: active }),
  setTargetPosition: (pos) => set({ targetPosition: pos }),
  addAmmo: (type, count) => set((state) => ({
    ammo: { ...state.ammo, [type]: (state.ammo[type] ?? 0) + count },
  })),
  consumeAmmo: (type) => {
    const current = get().ammo[type] ?? 0
    if (current <= 0) return false
    set((state) => ({ ammo: { ...state.ammo, [type]: current - 1 } }))
    return true
  },

  pickupItem: (tileX, tileY) => set((state) => {
    const idx = state.mapItems.findIndex((mi) => mi.tileX === tileX && mi.tileY === tileY)
    if (idx === -1) return state
    const mi = state.mapItems[idx]
    const remainingMapItems = state.mapItems.filter((_, i) => i !== idx)

    // Ammo goes into the shared ammo pool, not the backpack.
    if (mi.item.type === 'ammo' && mi.item.effects.ammoType) {
      const type = mi.item.effects.ammoType
      const count = mi.item.effects.ammoCount ?? 1
      return {
        mapItems: remainingMapItems,
        ammo: { ...state.ammo, [type]: (state.ammo[type] ?? 0) + count },
        log: [...state.log, `Picked up ${mi.item.name} (+${count} ${type}).`],
      }
    }

    return {
      mapItems: remainingMapItems,
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

    if (item.effects.torchRefill !== undefined) {
      const newTorch = Math.min(state.maxTorchDuration, state.torchDuration + item.effects.torchRefill)
      return {
        torchDuration: newTorch,
        inventory: state.inventory.filter((i) => i.id !== itemId),
        log: [...state.log, `${member.name} lights a fresh ${item.name}. The darkness retreats.`],
      }
    }

    if (item.type === 'potion') {
      if (item.effects.hpBonus !== undefined) {
        // Healing potion: roll 2d4
        const heal = Array.from({ length: 2 }, () => Math.floor(Math.random() * 4) + 1).reduce((a, b) => a + b, 0)
        const newHp = Math.min(member.maxHp, member.hp + heal)
        const actualHeal = newHp - member.hp
        logMsg = `${member.name} drinks ${item.name} and heals ${actualHeal} HP.`
        newParty = state.party.map((m, i) =>
          i === memberIndex ? { ...m, hp: newHp } : m
        )
      } else if (item.effects.mpRestore !== undefined) {
        // Mana potion: restore MP
        const restore = item.effects.mpRestore
        const newMp = Math.min(member.maxMp, member.mp + restore)
        const actualRestore = newMp - member.mp
        logMsg = `${member.name} drinks ${item.name} and recovers ${actualRestore} MP.`
        newParty = state.party.map((m, i) =>
          i === memberIndex ? { ...m, mp: newMp } : m
        )
      }
    }

    return {
      party: newParty,
      inventory: state.inventory.filter((i) => i.id !== itemId),
      log: [...state.log, logMsg],
    }
  }),

  spendMp: (memberIndex, amount) => set((state) => ({
    party: state.party.map((m, i) =>
      i === memberIndex ? { ...m, mp: Math.max(0, m.mp - amount) } : m
    ),
  })),

  restoreMp: (memberIndex, amount) => set((state) => ({
    party: state.party.map((m, i) =>
      i === memberIndex ? { ...m, mp: Math.min(m.maxMp, m.mp + amount) } : m
    ),
  })),

  addStatusEffect: (effect) => set((state) => ({
    activeStatusEffects: [...state.activeStatusEffects, effect],
  })),

  removeStatusEffect: (effectId) => set((state) => ({
    activeStatusEffects: state.activeStatusEffects.filter((e) => e.id !== effectId),
  })),

  activateTrigger: (x, y) => set((state) => {
    const key = `${x},${y}`
    if (state.triggerStates[key]) return state
    const level = state.levels[state.currentLevelId]
    const link = level?.triggerLinks?.find((l) => l.triggerX === x && l.triggerY === y)
    if (!link) return state

    const logEntries: string[] = []
    const newDoorStates = { ...state.doorStates }
    const newSecretDoors = { ...state.secretDoorsRevealed }

    if (link.action === 'open_door' || link.action === 'close_door') {
      const dk = `${link.targetX},${link.targetY}`
      const tile = state.dungeonMap[link.targetY]?.[link.targetX]
      if (tile !== undefined && isDoor(tile)) {
        const opening = link.action === 'open_door'
        newDoorStates[dk] = opening
        logEntries.push(opening ? 'A door slides open!' : 'A door slams shut!')
      }
    } else if (link.action === 'reveal_secret_door') {
      const sk = `${link.targetX},${link.targetY}`
      if (!newSecretDoors[sk]) {
        newSecretDoors[sk] = true
        logEntries.push('You hear a grinding noise... a secret door is revealed!')
      }
    } else if (link.action === 'damage') {
      const amount = link.damageAmount ?? 1
      logEntries.push(`A trap fires! ${amount} damage!`)
      const newParty = state.party.map((m) => ({
        ...m,
        hp: Math.max(0, m.hp - amount),
      }))
      return {
        party: newParty,
        triggerStates: { ...state.triggerStates, [key]: true },
        log: [...state.log, ...logEntries],
      }
    }

    return {
      triggerStates: { ...state.triggerStates, [key]: true },
      doorStates: newDoorStates,
      secretDoorsRevealed: newSecretDoors,
      log: [...state.log, ...logEntries],
    }
  }),

  toggleSwitch: (x, y) => set((state) => {
    const key = `${x},${y}`
    const current = state.switchStates[key] ?? false
    const newState = !current
    const level = state.levels[state.currentLevelId]
    const link = level?.triggerLinks?.find(
      (l) => l.triggerX === x && l.triggerY === y && l.triggerType === 'switch'
    )
    if (!link) {
      return { switchStates: { ...state.switchStates, [key]: newState } }
    }

    const logEntries: string[] = [`You flip the switch ${newState ? 'on' : 'off'}.`]
    const newDoorStates = { ...state.doorStates }
    const newSecretDoors = { ...state.secretDoorsRevealed }

    if (link.action === 'open_door') {
      const dk = `${link.targetX},${link.targetY}`
      const tile = state.dungeonMap[link.targetY]?.[link.targetX]
      if (tile !== undefined && isDoor(tile)) {
        newDoorStates[dk] = newState
        logEntries.push(newState ? 'A door opens!' : 'A door closes!')
      }
    } else if (link.action === 'close_door') {
      const dk = `${link.targetX},${link.targetY}`
      const tile = state.dungeonMap[link.targetY]?.[link.targetX]
      if (tile !== undefined && isDoor(tile)) {
        newDoorStates[dk] = newState
        logEntries.push(newState ? 'A door closes!' : 'A door opens!')
      }
    } else if (link.action === 'reveal_secret_door') {
      const sk = `${link.targetX},${link.targetY}`
      if (newState && !newSecretDoors[sk]) {
        newSecretDoors[sk] = true
        logEntries.push('A secret door is revealed!')
      }
    } else if (link.action === 'damage') {
      const amount = link.damageAmount ?? 1
      logEntries.push(`A trap fires! ${amount} damage!`)
      const newParty = state.party.map((m) => ({
        ...m,
        hp: Math.max(0, m.hp - amount),
      }))
      return {
        party: newParty,
        switchStates: { ...state.switchStates, [key]: newState },
        log: [...state.log, ...logEntries],
      }
    }

    return {
      switchStates: { ...state.switchStates, [key]: newState },
      doorStates: newDoorStates,
      secretDoorsRevealed: newSecretDoors,
      log: [...state.log, ...logEntries],
    }
  }),

  damagePartyAll: (amount) => set((state) => ({
    party: state.party.map((m) => ({
      ...m,
      hp: Math.max(0, m.hp - amount),
    })),
    log: [...state.log, `All party members take ${amount} damage!`],
  })),

  changeLevel: (levelId, entry, facing) => {
    const state = get()

    // Save current level's scoped state
    const scoped: LevelScopedState = {
      exploredTiles: state.exploredTiles,
      doorStates: state.doorStates,
      secretDoorsRevealed: state.secretDoorsRevealed,
      encounterTriggers: state.encounterTriggers,
      mapItems: state.mapItems,
      triggerStates: state.triggerStates,
      switchStates: state.switchStates,
      npcs: state.npcs,
    }
    const perLevelStates = { ...state.perLevelStates, [state.currentLevelId]: scoped }

    // Look up target level
    const target = state.levels[levelId]
    if (!target) {
      state.addLogMessage(`Level "${levelId}" not found.`)
      return
    }

    // Restore target level's scoped state
    const saved = perLevelStates[levelId]
    set({
      currentLevelId: levelId,
      dungeonMap: target.tiles,
      floorTexture: target.floorTexture,
      wallTexture: target.wallTexture,
      playerPosition: entry,
      playerFacing: facing,
      encounterTriggers: saved?.encounterTriggers ?? target.encounters,
      mapItems: saved?.mapItems ?? target.items,
      exploredTiles: saved?.exploredTiles ?? {},
      doorStates: saved?.doorStates ?? {},
      secretDoorsRevealed: saved?.secretDoorsRevealed ?? {},
      triggerStates: saved?.triggerStates ?? {},
      switchStates: saved?.switchStates ?? {},
      npcs: saved?.npcs ?? target.npcs ?? [],
      combatState: 'idle',
      enemies: [],
      currentTargetEnemyId: null,
      defendingMemberIds: [],
      perLevelStates,
      log: [...state.log, `You descend into ${target.name}.`],
    })
  },

  loadLevel: (level) => {
    const state = get()
    const levels = { ...state.levels, [level.id]: level }
    set({ levels })
    state.changeLevel(level.id, level.startPosition, level.startFacing)
  },

  registerLevel: (level) => set((state) => ({
    levels: { ...state.levels, [level.id]: level },
  })),

  loadModule: (moduleLevels, entryLevelId) => {
    const state = get()
    if (moduleLevels.length === 0) {
      state.addLogMessage('Module contains no levels.')
      return
    }
    const newLevels = { ...state.levels }
    for (const lvl of moduleLevels) newLevels[lvl.id] = lvl
    const entry = newLevels[entryLevelId] ?? moduleLevels[0]
    // Start the campaign fresh: drop any previously saved per-level state.
    set({ levels: newLevels, perLevelStates: {} })
    get().changeLevel(entry.id, entry.startPosition, entry.startFacing)
  },

  startDialogue: (npcId) => {
    const npc = get().npcs.find((n) => n.id === npcId)
    if (!npc) return
    set({
      activeNpcId: npcId,
      currentDialogueNodeId: npc.dialogueStartNodeId,
      showShop: false,
    })
  },

  chooseDialogueOption: (choice) => {
    const nextNodeId = choice.nextNodeId
    const action = choice.action

    if (action === 'open_shop') {
      set({ showShop: true })
    } else if (action === 'heal_party') {
      const newParty = get().party.map((m) => ({
        ...m,
        hp: m.maxHp,
        mp: m.maxMp,
      }))
      set({
        party: newParty,
        log: [...get().log, 'The priest heals your wounds and restores your magic!'],
      })
      if (nextNodeId === null) {
        set({ activeNpcId: null, currentDialogueNodeId: null })
      } else {
        set({ currentDialogueNodeId: nextNodeId })
      }
    } else {
      if (nextNodeId === null) {
        set({ activeNpcId: null, currentDialogueNodeId: null })
      } else {
        set({ currentDialogueNodeId: nextNodeId })
      }
    }
  },

  endDialogue: () => set({ activeNpcId: null, currentDialogueNodeId: null, showShop: false }),

  buyItem: (itemId, price) => {
    const state = get()
    if (state.gold < price) {
      set({ log: [...state.log, 'Not enough gold!'] })
      return
    }

    const template = itemTemplates[itemId]
    if (!template) return

    const merchant = state.npcs.find((n) => n.id === state.activeNpcId)
    if (!merchant || !merchant.shopItems || !merchant.shopItems.includes(itemId)) {
      return
    }

    // Remove one copy of itemId from merchant's stock
    let removed = false
    const newShopItems = merchant.shopItems.filter((id) => {
      if (!removed && id === itemId) {
        removed = true
        return false
      }
      return true
    })

    const newItem = { ...template, id: `${template.id}_instance_${Date.now()}` }

    set({
      gold: state.gold - price,
      inventory: [...state.inventory, newItem],
      npcs: state.npcs.map((n) =>
        n.id === state.activeNpcId ? { ...n, shopItems: newShopItems } : n
      ),
      log: [...state.log, `Bought ${template.name} for ${price} gold.`],
    })
  },

  sellItem: (itemId, price) => {
    const state = get()
    const item = state.inventory.find((i) => i.id === itemId)
    if (!item) return

    const merchant = state.npcs.find((n) => n.id === state.activeNpcId)
    if (!merchant) return

    const baseId = item.id.includes('_instance_')
      ? item.id.split('_instance_')[0]
      : item.id

    const newShopItems = [...(merchant.shopItems ?? []), baseId]

    set({
      gold: state.gold + price,
      inventory: state.inventory.filter((i) => i.id !== itemId),
      npcs: state.npcs.map((n) =>
        n.id === state.activeNpcId ? { ...n, shopItems: newShopItems } : n
      ),
      log: [...state.log, `Sold ${item.name} for ${price} gold.`],
    })
  },
}))
