import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  color: string
  label: string
}

export function EnemyBillboard({ position, color, label }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

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
