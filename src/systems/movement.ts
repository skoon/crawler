import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'
import { isSolid, isDoor, isStairs, isSwitch, getTile } from '../map/mapUtils'
import { TILE_STAIRS_UP, TILE_SECRET_DOOR } from '../types'
import { useKeyboard } from '../hooks/useKeyboard'
import { saveGame, loadGame } from './saveLoad'

const MOVE_INTERVAL = 150

export function useMovementSystem(isPaused: boolean = false) {
  const keys = useKeyboard()
  const lastMove = useRef(0)
  const restKeyWasDown = useRef(false)

  useEffect(() => {
    const handler = () => {
      if (isPaused) return

      const pressed = keys.current

      // Rest toggle (edge-detected so a held key toggles only once).
      const rDown = pressed.has('KeyR')
      if (rDown && !restKeyWasDown.current) {
        restKeyWasDown.current = true
        const s = useGameStore.getState()
        if (s.combatState === 'idle' && s.activeNpcId === null && !s.showShop) {
          if (s.isResting) s.stopRest()
          else s.startRest()
        }
      } else if (!rDown) {
        restKeyWasDown.current = false
      }

      const now = Date.now()
      if (now - lastMove.current < MOVE_INTERVAL) return

      const state = useGameStore.getState()
      if (state.activeNpcId !== null || state.showShop) return
      if (state.isResting) return // no movement while making camp

      // While aiming a ranged shot, arrows steer the reticle instead of the party.
      if (state.targetingMode) {
        const weapon = state.party[state.selectedMemberIndex]?.equipment.weapon
        const range = weapon?.effects.range ?? 1
        const base = state.targetPosition ?? state.playerPosition
        const facing = state.playerFacing
        const aimUp = pressed.has('ArrowUp') || pressed.has('KeyW')
        const aimDown = pressed.has('ArrowDown') || pressed.has('KeyS')
        const aimLeft = pressed.has('ArrowLeft') || pressed.has('KeyA')
        const aimRight = pressed.has('ArrowRight') || pressed.has('KeyD')
        let rdx = 0
        let rdy = 0
        // Facing-relative aiming so "forward" points where the party is looking.
        if (aimUp) { if (facing === 0) rdy = -1; else if (facing === 1) rdx = 1; else if (facing === 2) rdy = 1; else rdx = -1 }
        else if (aimDown) { if (facing === 0) rdy = 1; else if (facing === 1) rdx = -1; else if (facing === 2) rdy = -1; else rdx = 1 }
        else if (aimLeft) { if (facing === 0) rdx = -1; else if (facing === 1) rdy = -1; else if (facing === 2) rdx = 1; else rdy = 1 }
        else if (aimRight) { if (facing === 0) rdx = 1; else if (facing === 1) rdy = 1; else if (facing === 2) rdx = -1; else rdy = -1 }

        if (rdx !== 0 || rdy !== 0) {
          const nx = base.x + rdx
          const ny = base.y + rdy
          const inBounds = ny >= 0 && ny < state.dungeonMap.length && nx >= 0 && nx < state.dungeonMap[0].length
          const inRange = Math.max(Math.abs(nx - state.playerPosition.x), Math.abs(ny - state.playerPosition.y)) <= range
          if (inBounds && inRange) {
            state.setTargetPosition({ x: nx, y: ny })
            lastMove.current = now
          }
        }
        return
      }

      let dx = 0
      let dy = 0
      let turn = 0

      if (pressed.has('F5')) {
        saveGame(0)
        lastMove.current = now
        return
      }
      if (pressed.has('F9')) {
        loadGame(0)
        lastMove.current = now
        return
      }

      const interact = pressed.has('Space') || pressed.has('Enter')
      const forward = pressed.has('ArrowUp') || pressed.has('KeyW')
      const backward = pressed.has('ArrowDown') || pressed.has('KeyS')
      const left = pressed.has('ArrowLeft') || pressed.has('KeyA')
      const right = pressed.has('ArrowRight') || pressed.has('KeyD')
      const shift = pressed.has('ShiftLeft') || pressed.has('ShiftRight')

      if (interact) {
        const facing = state.playerFacing
        let doorX = state.playerPosition.x
        let doorY = state.playerPosition.y
        if (facing === 0) doorY -= 1
        else if (facing === 1) doorX += 1
        else if (facing === 2) doorY += 1
        else if (facing === 3) doorX -= 1
        
        // NPC interaction check
        const npc = state.npcs.find((n) => n.tileX === doorX && n.tileY === doorY)
        if (npc) {
          state.startDialogue(npc.id)
          lastMove.current = now
          return
        }

        const tile = getTile(state.dungeonMap, doorX, doorY)
        if (isDoor(tile)) {
          state.toggleDoor(doorX, doorY)
          lastMove.current = now
          return
        }
        if (isSwitch(tile)) {
          state.toggleSwitch(doorX, doorY)
          lastMove.current = now
          return
        }
      }

      if (left && shift) {
        // Strafe left — 90° counter-clockwise from facing
        const facing = state.playerFacing
        if (facing === 0) { dx = -1 }
        else if (facing === 1) { dy = -1 }
        else if (facing === 2) { dx = 1 }
        else if (facing === 3) { dy = 1 }
      } else if (right && shift) {
        // Strafe right — 90° clockwise from facing
        const facing = state.playerFacing
        if (facing === 0) { dx = 1 }
        else if (facing === 1) { dy = 1 }
        else if (facing === 2) { dx = -1 }
        else if (facing === 3) { dy = -1 }
      } else if (left) {
        turn = -1
      } else if (right) {
        turn = 1
      }

      if (forward || backward) {
        const dir = backward ? -1 : 1
        const facing = state.playerFacing
        if (facing === 0) { dy = -dir }
        else if (facing === 1) { dx = dir }
        else if (facing === 2) { dy = dir }
        else if (facing === 3) { dx = -dir }
      }

      if (turn !== 0) {
        const newFacing = (state.playerFacing + turn + 4) % 4
        useGameStore.getState().setPlayerFacing(newFacing)
        lastMove.current = now
        return
      }

      if (dx !== 0 || dy !== 0) {
        const targetX = state.playerPosition.x + dx
        const targetY = state.playerPosition.y + dy
        const tile = getTile(state.dungeonMap, targetX, targetY)
        const isRevealedSecret = tile === TILE_SECRET_DOOR && state.secretDoorsRevealed[`${targetX},${targetY}`]
        const isDoorOpen = isDoor(tile) && state.doorStates[`${targetX},${targetY}`]
        if (!isSolid(tile) || isDoorOpen || isRevealedSecret) {
          useGameStore.getState().setPlayerPosition({ x: targetX, y: targetY })
          lastMove.current = now

          // Stairs transition
          if (isStairs(tile)) {
            const fresh = useGameStore.getState()
            const currentLevel = fresh.levels[fresh.currentLevelId]
            const transition = currentLevel?.transitions?.find(
              (t) => t.tileX === targetX && t.tileY === targetY
            )
            if (transition) {
              const dir = tile === TILE_STAIRS_UP ? 'ascend' : 'descend'
              fresh.addLogMessage(`You ${dir} the stairs...`)
              setTimeout(() => {
                useGameStore.getState().changeLevel(
                  transition.targetLevelId,
                  transition.targetPosition,
                  transition.targetFacing,
                )
              }, 300)
            }
          }
        }
      }
    }

    const id = setInterval(handler, MOVE_INTERVAL / 2)
    return () => clearInterval(id)
  }, [keys, isPaused])
}
