import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { useGameStore } from '../store'
import { TILE_SIZE } from '../types'
import { isRangedWeapon, enemyAt, hasLineOfSight, tileDistance } from '../systems/rangedCombat'

export function TargetingReticle() {
  const targetingMode = useGameStore((s) => s.targetingMode)
  const targetPosition = useGameStore((s) => s.targetPosition)
  const playerPosition = useGameStore((s) => s.playerPosition)
  const enemies = useGameStore((s) => s.enemies)
  const dungeonMap = useGameStore((s) => s.dungeonMap)
  const doorStates = useGameStore((s) => s.doorStates)
  const secretDoorsRevealed = useGameStore((s) => s.secretDoorsRevealed)
  const party = useGameStore((s) => s.party)
  const selectedIndex = useGameStore((s) => s.selectedMemberIndex)

  const reticleRef = useRef<Mesh>(null)

  const weapon = party[selectedIndex]?.equipment.weapon
  const range = isRangedWeapon(weapon) ? weapon!.effects.range ?? 1 : 0

  useFrame(({ clock }) => {
    if (reticleRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 6) * 0.12
      reticleRef.current.scale.set(pulse, pulse, 1)
    }
  })

  if (!targetingMode || !targetPosition || range <= 0) return null

  const inRange = tileDistance(playerPosition, targetPosition) <= range
  const los = hasLineOfSight(
    dungeonMap,
    playerPosition.x,
    playerPosition.y,
    targetPosition.x,
    targetPosition.y,
    doorStates,
    secretDoorsRevealed,
  )
  const hasTarget = enemyAt(enemies, targetPosition.x, targetPosition.y) !== null
  // Green = a clear shot at an enemy; yellow = valid tile but nothing to hit; red = blocked/out of range.
  const color = !inRange || !los ? '#ff4d4d' : hasTarget ? '#4dff6a' : '#ffd24d'

  const cx = targetPosition.x * TILE_SIZE + TILE_SIZE / 2
  const cz = targetPosition.y * TILE_SIZE + TILE_SIZE / 2
  const px = playerPosition.x * TILE_SIZE + TILE_SIZE / 2
  const pz = playerPosition.y * TILE_SIZE + TILE_SIZE / 2
  const ringRadius = range * TILE_SIZE

  return (
    <>
      {/* Reticle over the aimed tile */}
      <mesh ref={reticleRef} position={[cx, 0.06, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[TILE_SIZE * 0.28, TILE_SIZE * 0.42, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} depthTest={false} />
      </mesh>
      {/* Filled tile tint */}
      <mesh position={[cx, 0.04, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} depthTest={false} />
      </mesh>
      {/* Max-range boundary centered on the party */}
      <mesh position={[px, 0.03, pz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringRadius - 0.06, ringRadius, 48]} />
        <meshBasicMaterial color="#6fa8ff" transparent opacity={0.35} depthTest={false} />
      </mesh>
    </>
  )
}
