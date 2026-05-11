import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useGameStore } from '../store'

const FACING_ROTATIONS: Record<number, [number, number, number]> = {
  0: [0, 0, 0],
  1: [0, Math.PI / 2, 0],
  2: [0, Math.PI, 0],
  3: [0, -Math.PI / 2, 0],
}

const LERP_FACTOR = 0.1

export function DungeonViewCamera() {
  const { camera } = useThree()
  const playerPosition = useGameStore((s) => s.playerPosition)
  const playerFacing = useGameStore((s) => s.playerFacing)
  const targetPos = useRef(new Vector3())
  const targetRot = useRef({ x: 0, y: 0, z: 0 })

  targetPos.current.set(playerPosition.x + 0.5, 1.6, playerPosition.y + 0.5)
  const facing = playerFacing as keyof typeof FACING_ROTATIONS
  const [rx, ry, rz] = FACING_ROTATIONS[facing] ?? [0, 0, 0]
  targetRot.current = { x: rx, y: ry, z: rz }

  useFrame(() => {
    camera.position.lerp(targetPos.current, LERP_FACTOR)

    camera.rotation.x += (targetRot.current.x - camera.rotation.x) * LERP_FACTOR
    camera.rotation.y += (targetRot.current.y - camera.rotation.y) * LERP_FACTOR
    camera.rotation.z += (targetRot.current.z - camera.rotation.z) * LERP_FACTOR
  })

  return null
}
