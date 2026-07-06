import type { LevelTransition } from '../types'

const FACING_NAMES = ['North', 'East', 'South', 'West']

export interface StairsTravelPlan {
  /** Message to write to the adventure log, or null for silence. */
  log: string | null
  /** Whether to actually change levels. */
  travel: boolean
}

/**
 * Decide what stepping onto a stairs tile should do.
 *
 * In test mode (a single level launched from the editor's "Test Map") we don't
 * silently fail when the linked level isn't loaded — we write out exactly which
 * map the stairs point to so the author can verify the wiring, and only travel
 * if that target actually happens to be present in the session.
 */
export function stairsTravelPlan(opts: {
  testMode: boolean
  transition?: LevelTransition
  dir: 'ascend' | 'descend'
  targetLoaded: boolean
}): StairsTravelPlan {
  const { testMode, transition, dir, targetLoaded } = opts

  if (testMode) {
    if (!transition) {
      return { log: `[Test] These stairs (${dir}) are not linked to any level.`, travel: false }
    }
    const facing = FACING_NAMES[transition.targetFacing] ?? String(transition.targetFacing)
    const { x, y } = transition.targetPosition
    return {
      log: `[Test] Stairs ${dir} → level "${transition.targetLevelId}" at (${x}, ${y}) facing ${facing}.`,
      travel: targetLoaded,
    }
  }

  if (transition) {
    return { log: `You ${dir} the stairs...`, travel: true }
  }
  return { log: null, travel: false }
}
