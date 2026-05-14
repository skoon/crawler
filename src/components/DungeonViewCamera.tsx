import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'
import { useGameStore } from '../store'
import { TILE_SIZE } from '../types'

// In Three.js, positive Y rotation turns left (counter-clockwise).
// North (-Z) is 0, East (+X) is clockwise (-PI/2), South (+Z) is PI, West (-X) is counter-clockwise (+PI/2).
const FACING_ANGLES: Record<number, number> = {
  0: 0,                     // North
  1: -Math.PI / 2,          // East
  2: Math.PI,               // South
  3: Math.PI / 2,           // West
}

const LERP_FACTOR = 0.1

/** Shortest-path angle interpolation */
function lerpAngle(current: number, target: number, t: number): number {
  let delta = target - current
  // Wrap delta into [-π, π] so we always take the short way round
  delta = ((delta % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI
  return current + delta * t
}

export function DungeonViewCamera() {
  const { camera } = useThree()
  const playerPosition = useGameStore((s) => s.playerPosition)
  const playerFacing = useGameStore((s) => s.playerFacing)
  const targetPos = useRef(new Vector3())
  const targetAngleY = useRef(0)
  const lightRef = useRef<any>(null)

  targetPos.current.set(playerPosition.x * TILE_SIZE + TILE_SIZE / 2, 1.6, playerPosition.y * TILE_SIZE + TILE_SIZE / 2)
  targetAngleY.current = FACING_ANGLES[playerFacing] ?? 0

  useFrame(() => {
    camera.position.lerp(targetPos.current, LERP_FACTOR)

    camera.rotation.y = lerpAngle(camera.rotation.y, targetAngleY.current, LERP_FACTOR)
    // x and z rotations stay at 0 (no pitch/roll in a dungeon crawler)
    camera.rotation.x *= (1 - LERP_FACTOR)
    camera.rotation.z *= (1 - LERP_FACTOR)

    // Sync torchlight with camera position
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position)
    }
  })

  return (
    <pointLight 
      ref={lightRef} 
      distance={12} 
      decay={2} 
      intensity={3.0} 
      color="#ffddaa" 
    />
  )
}
