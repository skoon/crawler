import { useGameStore } from '../store'
import { isWalkable } from '../map/mapUtils'
import { resolveEnemyAttack } from './combatResolution'
import { canAct, getEffectiveAc } from './statusEffects'
import { audio } from './audio'

interface Point {
  x: number
  y: number
}

export function findPath(
  map: number[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): Point[] {
  const height = map.length
  const width = map[0].length
  const visited = new Set<string>()
  const parent = new Map<string, Point | null>()

  const key = (x: number, y: number) => `${x},${y}`
  const queue: Point[] = [{ x: startX, y: startY }]
  visited.add(key(startX, startY))
  parent.set(key(startX, startY), null)

  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ]

  while (queue.length > 0) {
    const cur = queue.shift()!
    if (cur.x === endX && cur.y === endY) {
      const path: Point[] = []
      let node: Point | null = cur
      while (node) {
        path.unshift(node)
        node = parent.get(key(node.x, node.y)) ?? null
      }
      return path
    }

    for (const d of dirs) {
      const nx = cur.x + d.x
      const ny = cur.y + d.y
      const k = key(nx, ny)
      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        !visited.has(k) &&
        isWalkable(map[ny][nx])
      ) {
        visited.add(k)
        parent.set(k, cur)
        queue.push({ x: nx, y: ny })
      }
    }
  }

  return []
}

export function processEnemyTurn() {
  const state = useGameStore.getState()
  const { enemies, playerPosition, dungeonMap, party } = state

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue

    if (!canAct(state.activeStatusEffects, enemy.id)) {
      state.addLogMessage(`${enemy.name} is unable to act and skips their turn.`)
      continue
    }

    const dx = Math.abs(enemy.tileX - playerPosition.x)
    const dy = Math.abs(enemy.tileY - playerPosition.y)

    if (dx + dy === 1) {
      const targetIdx = Math.floor(Math.random() * party.length)
      const target = party[targetIdx]
      if (!target || target.hp <= 0) continue

      // Calculate AC bonus from equipment
      const acBonus = Object.values(target.equipment ?? {}).reduce(
        (sum, item) => sum + (item?.effects.acBonus ?? 0), 0
      )

      const baseAc = target.ac - acBonus
      const effectiveAc = getEffectiveAc(baseAc, state.activeStatusEffects, target.id)
      const result = resolveEnemyAttack(enemy.thac0, enemy.damage, enemy.damageBonus, effectiveAc)
      audio.playSound('swing')
      if (result.hit) {
        state.damageMember(targetIdx, result.damage)
        state.addLogMessage(`${enemy.name} hits ${target.name} for ${result.damage} damage!`)
        audio.playPositional('hit', enemy.tileX, enemy.tileY)
      } else {
        state.addLogMessage(`${enemy.name} misses ${target.name}.`)
        audio.playSound('miss')
      }
    } else {
      const path = findPath(dungeonMap, enemy.tileX, enemy.tileY, playerPosition.x, playerPosition.y)
      if (path.length >= 2) {
        const next = path[1]
        const otherEnemy = enemies.find(
          (e) => e.id !== enemy.id && e.tileX === next.x && e.tileY === next.y && e.hp > 0,
        )
        if (!otherEnemy) {
          state.moveEnemy(enemy.id, next.x, next.y)
        }
      }
    }
  }

  // End of round: tick bleed-out timers on downed members (may flag game over),
  // then decide the outcome from the *fresh* party state.
  state.processDeathSaves()
  const fresh = useGameStore.getState()
  if (fresh.gameOver || fresh.party.every((m) => m.hp <= 0)) {
    fresh.setCombatState('defeat')
  } else {
    fresh.setCombatState('playerTurn')
  }
  fresh.setDefending(fresh.selectedMemberIndex, false)
}
