import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointLight } from 'three'
import { useGameStore } from '../store'

/**
 * Ties scene lighting to the torch. As the torch burns down the ambient light
 * fades and a warm point light follows the camera, so the dungeon literally
 * gets darker the closer the torch is to going out. Replaces the old static
 * <ambientLight> in App so we don't have to re-tint every mesh each tick.
 */
export function TorchLighting() {
  const torchDuration = useGameStore((s) => s.torchDuration)
  const maxTorchDuration = useGameStore((s) => s.maxTorchDuration)
  const lightRef = useRef<PointLight>(null)

  const ratio = maxTorchDuration > 0 ? torchDuration / maxTorchDuration : 0
  // Even a dead torch leaves the faintest ambient glow so the player isn't fully blind.
  const ambient = 0.06 + ratio * 0.44
  const pointIntensity = torchDuration > 0 ? 6 + ratio * 10 : 0

  useFrame(({ camera, clock }) => {
    if (!lightRef.current) return
    // Keep the torchlight on the party, with a subtle flicker.
    lightRef.current.position.copy(camera.position)
    const flicker = torchDuration > 0 ? 1 + Math.sin(clock.elapsedTime * 12) * 0.06 : 0
    lightRef.current.intensity = pointIntensity * flicker
  })

  return (
    <>
      <ambientLight intensity={ambient} />
      <pointLight ref={lightRef} color="#ffb060" distance={8} decay={1.6} />
    </>
  )
}
