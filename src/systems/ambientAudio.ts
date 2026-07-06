import { useEffect } from 'react'
import { useGameStore } from '../store'
import { audio } from './audio'
import { TILE_PIT, TILE_TELEPORTER } from '../types'

/**
 * Periodic ambient cues while exploring: water drips from pit/teleporter tiles
 * and the occasional distant growl from a lurking encounter. Silent in combat.
 */
export function useAmbientAudio() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const dripTiles = () => {
      const map = useGameStore.getState().dungeonMap
      const tiles: { x: number; y: number }[] = []
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          if (map[y][x] === TILE_PIT || map[y][x] === TILE_TELEPORTER) tiles.push({ x, y })
        }
      }
      return tiles
    }

    const tick = () => {
      const state = useGameStore.getState()
      if (state.combatState === 'idle') {
        // Mostly drips, occasionally a growl from a remaining encounter.
        if (Math.random() < 0.25 && state.encounterTriggers.length > 0) {
          const trig = state.encounterTriggers[Math.floor(Math.random() * state.encounterTriggers.length)]
          audio.playPositional('growl', trig.x, trig.y, 0.7)
        } else {
          const tiles = dripTiles()
          if (tiles.length > 0) {
            const t = tiles[Math.floor(Math.random() * tiles.length)]
            audio.playPositional('drip', t.x, t.y, 1)
          }
        }
      }
      timer = setTimeout(tick, 3000 + Math.random() * 5000)
    }

    timer = setTimeout(tick, 3000 + Math.random() * 5000)
    return () => clearTimeout(timer)
  }, [])
}
