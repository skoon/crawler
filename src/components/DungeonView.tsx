import { useMemo } from 'react'
import { useGameStore } from '../store'
import { isOpaque, isDoor } from '../map/mapUtils'
import { TILE_WALL, TILE_SECRET_DOOR } from '../types'
import { EnemyBillboard } from './EnemyBillboard'
import { useTexture } from '@react-three/drei'
import { RepeatWrapping } from 'three'
import wallImg from '../assets/textures/wall.jpg'
import floorImg from '../assets/textures/floor.jpg'

const WALL_HEIGHT = 3
const WALL_THICKNESS = 0.1

const ENEMY_COLORS: Record<string, string> = {
  Goblin: '#c44',
  Skeleton: '#c8b090',
}

export function DungeonView() {
  const dungeonMap = useGameStore((s) => s.dungeonMap)
  const enemies = useGameStore((s) => s.enemies)
  const doorStates = useGameStore((s) => s.doorStates)
  const secretDoorsRevealed = useGameStore((s) => s.secretDoorsRevealed)
  const exploredTiles = useGameStore((s) => s.exploredTiles)

  const wallTexture = useTexture(wallImg)
  const floorTexture = useTexture(floorImg)

  wallTexture.wrapS = wallTexture.wrapT = RepeatWrapping
  wallTexture.repeat.set(1, 3)
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping
  floorTexture.repeat.set(1, 1)

  const meshes = useMemo(() => {
    const elements: React.ReactNode[] = []
    const height = dungeonMap.length
    const width = dungeonMap[0].length
    let key = 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = dungeonMap[y][x]
        if (tile === TILE_WALL) continue
        if (tile === TILE_SECRET_DOOR && !secretDoorsRevealed[`${x},${y}`]) continue
        if (!exploredTiles[`${x},${y}`]) continue

        // Floor
        elements.push(
          <mesh
            key={`floor-${x}-${y}`}
            position={[x + 0.5, 0, y + 0.5]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial map={floorTexture} />
          </mesh>,
        )
        key++

        // Ceiling
        elements.push(
          <mesh
            key={`ceil-${x}-${y}`}
            position={[x + 0.5, WALL_HEIGHT, y + 0.5]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color="#222" />
          </mesh>,
        )
        key++

        // Wall segments on the 4 edges
        // North edge (y-1)
        if (y > 0) {
          const neighbor = dungeonMap[y - 1][x]
          if (isOpaque(neighbor) !== isOpaque(tile)) {
            elements.push(
              <mesh
                key={`wall-n-${x}-${y}`}
                position={[x + 0.5, WALL_HEIGHT / 2, y]}
              >
                <boxGeometry args={[1, WALL_HEIGHT, WALL_THICKNESS]} />
                <meshStandardMaterial map={wallTexture} />
              </mesh>,
            )
            key++
          }
        }
        // South edge (y+1)
        if (y < height - 1) {
          const neighbor = dungeonMap[y + 1][x]
          if (isOpaque(neighbor) !== isOpaque(tile)) {
            elements.push(
              <mesh
                key={`wall-s-${x}-${y}`}
                position={[x + 0.5, WALL_HEIGHT / 2, y + 1]}
              >
                <boxGeometry args={[1, WALL_HEIGHT, WALL_THICKNESS]} />
                <meshStandardMaterial map={wallTexture} />
              </mesh>,
            )
            key++
          }
        }
        // West edge (x-1)
        if (x > 0) {
          const neighbor = dungeonMap[y][x - 1]
          if (isOpaque(neighbor) !== isOpaque(tile)) {
            elements.push(
              <mesh
                key={`wall-w-${x}-${y}`}
                position={[x, WALL_HEIGHT / 2, y + 0.5]}
              >
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, 1]} />
                <meshStandardMaterial map={wallTexture} />
              </mesh>,
            )
            key++
          }
        }
        // East edge (x+1)
        if (x < width - 1) {
          const neighbor = dungeonMap[y][x + 1]
          if (isOpaque(neighbor) !== isOpaque(tile)) {
            elements.push(
              <mesh
                key={`wall-e-${x}-${y}`}
                position={[x + 1, WALL_HEIGHT / 2, y + 0.5]}
              >
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, 1]} />
                <meshStandardMaterial map={wallTexture} />
              </mesh>,
            )
            key++
          }
        }

        // Door rendering
        if (isDoor(tile)) {
          const doorKey = `${x},${y}`
          if (!doorStates[doorKey]) {
            elements.push(
              <mesh
                key={`door-${x}-${y}`}
                position={[x + 0.5, WALL_HEIGHT / 2, y + 0.5]}
              >
                <boxGeometry args={[0.9, WALL_HEIGHT, 0.1]} />
                <meshStandardMaterial color="#654321" />
              </mesh>,
            )
            key++
          }
        }
      }
    }

    return elements
  }, [dungeonMap, doorStates, exploredTiles, wallTexture, floorTexture])

  const enemySprites = useMemo(
    () =>
      enemies
        .filter((e) => e.hp > 0)
        .map((enemy) => (
          <EnemyBillboard
            key={enemy.id}
            position={[enemy.tileX + 0.5, 1.2, enemy.tileY + 0.5]}
            color={ENEMY_COLORS[enemy.name] ?? '#c44'}
            label={enemy.name}
          />
        )),
    [enemies],
  )

  return <>{meshes}{enemySprites}</>
}
