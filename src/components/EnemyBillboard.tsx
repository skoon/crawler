import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { audio } from '../systems/audio'
import type { SfxName } from '../systems/audio'

interface Props {
  position: [number, number, number]
  color: string
  label: string
  idleSfx?: SfxName
  tileX?: number
  tileY?: number
}

export function EnemyBillboard({ position, color, label, idleSfx, tileX, tileY }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  const tileRef = useRef({ x: tileX ?? 0, y: tileY ?? 0 })
  useEffect(() => {
    tileRef.current = { x: tileX ?? 0, y: tileY ?? 0 }
  }, [tileX, tileY])

  useEffect(() => {
    if (!idleSfx) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        audio.playPositional(idleSfx, tileRef.current.x, tileRef.current.y, 0.5)
        schedule()
      }, 4000 + Math.random() * 6000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [idleSfx])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Text
        position={[0, 0.75, 0.01]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}
