import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'
import { isSolid, isDoor, getTile } from '../map/mapUtils'
import { TILE_SECRET_DOOR } from '../types'
import { useKeyboard } from '../hooks/useKeyboard'
import { saveGame, loadGame } from './saveLoad'

const MOVE_INTERVAL = 150

export function useMovementSystem(isPaused: boolean = false) {
  const keys = useKeyboard()
  const lastMove = useRef(0)

  useEffect(() => {
    const handler = () => {
      if (isPaused) return
      
      const now = Date.now()
      if (now - lastMove.current < MOVE_INTERVAL) return

      const state = useGameStore.getState()
      const pressed = keys.current
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
        const tile = getTile(state.dungeonMap, doorX, doorY)
        if (isDoor(tile)) {
          state.toggleDoor(doorX, doorY)
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
        if (!isSolid(tile) || isRevealedSecret) {
          useGameStore.getState().setPlayerPosition({ x: targetX, y: targetY })
          lastMove.current = now
        }
      }
    }

    const id = setInterval(handler, MOVE_INTERVAL / 2)
    return () => clearInterval(id)
  }, [keys, isPaused])
}
