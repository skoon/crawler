import { useEffect } from 'react'
import { useGameStore } from '../store'
import { audio } from './audio'
import type { MusicTrack } from './audio'

export type AppMode = 'menu' | 'game' | 'editor'

function trackFor(mode: AppMode, inCombat: boolean): MusicTrack {
  if (mode !== 'game') return 'menu'
  return inCombat ? 'combat' : 'explore'
}

/**
 * Drives background music from app mode + combat state. Combat swaps in the
 * tense drone immediately and cross-fades back to the exploration bed when the
 * fight ends. Menu/editor share the calm ambience bed.
 */
export function useMusicManager(mode: AppMode) {
  useEffect(() => {
    const apply = () => {
      const inCombat = useGameStore.getState().combatState !== 'idle'
      audio.playMusic(trackFor(mode, inCombat))
    }
    apply()

    const unsub = useGameStore.subscribe((state, prev) => {
      const was = prev.combatState !== 'idle'
      const now = state.combatState !== 'idle'
      if (was !== now) audio.playMusic(trackFor(mode, now))
    })
    return unsub
  }, [mode])
}
