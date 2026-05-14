import { useMemo } from 'react'
import { useGameStore } from '../store'
import { isOpaque, isDoor } from '../map/mapUtils'
import { TILE_SIZE, TILE_WALL, TILE_SECRET_DOOR } from '../types'
import type { MapItem } from '../types'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { useRef } from 'react'
import { EnemyBillboard } from './EnemyBillboard'
import { useTexture } from '@react-three/drei'
import { RepeatWrapping } from 'three'
import wallImg from '../assets/textures/wall1.jpg'
import floorImg from '../assets/textures/floor1.jpg'
import ceilingImg from '../assets/textures/ceiling1.jpg'
import doorImg from '../assets/textures/closed_door.jpg'

const WALL_HEIGHT = 3
const WALL_THICKNESS = 0.1

const ENEMY_COLORS: Record<string, string> = {
  Goblin: '#c44',
  Skeleton: '#c8b090',
}

function ItemPrimitive({ mapItem }: { mapItem: MapItem }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02
      meshRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2 + mapItem.tileX * 10) * 0.05
    }
  })

  const typeColors: Record<string, string> = {
    weapon: '#aaaaaa',
    armor: '#4444aa',
    potion: '#aa4444',
    shield: '#44aa44',
    ring: '#aaaa44',
  }
  const color = typeColors[mapItem.item.type] || '#ffffff'

  return (
    <mesh
      ref={meshRef}
      position={[mapItem.tileX * TILE_SIZE + TILE_SIZE / 2, 0.3, mapItem.tileY * TILE_SIZE + TILE_SIZE / 2]}
      rotation={[Math.PI / 4, 0, Math.PI / 4]}
    >
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export function DungeonView() {
  const dungeonMap = useGameStore((s) => s.dungeonMap)
  const enemies = useGameStore((s) => s.enemies)
  const doorStates = useGameStore((s) => s.doorStates)
  const secretDoorsRevealed = useGameStore((s) => s.secretDoorsRevealed)
  const exploredTiles = useGameStore((s) => s.exploredTiles)
  const mapItems = useGameStore((s) => s.mapItems)
  const storeWallTexture = useGameStore((s) => s.wallTexture)
  const storeFloorTexture = useGameStore((s) => s.floorTexture)

  const wallTexture = useTexture(storeWallTexture || wallImg)
  const floorTexture = useTexture(storeFloorTexture || floorImg)
  const ceilingTexture = useTexture(ceilingImg)
  const doorTexture = useTexture(doorImg)

  wallTexture.wrapS = wallTexture.wrapT = RepeatWrapping
  wallTexture.repeat.set(1, 1)
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping
  floorTexture.repeat.set(2, 2)
  ceilingTexture.wrapS = ceilingTexture.wrapT = RepeatWrapping
  ceilingTexture.repeat.set(2, 2)

  const meshes = useMemo(() => {
    const elements: React.ReactNode[] = []
    const height = dungeonMap.length
    const width = dungeonMap[0].length
    let key = 0

    const localIsOpaque = (t: number, tx: number, ty: number) => {
      if (t === TILE_SECRET_DOOR) {
        return !secretDoorsRevealed[`${tx},${ty}`]
      }
      if (isDoor(t)) {
        return !doorStates[`${tx},${ty}`]
      }
      return isOpaque(t)
    }

    // Helper to get tile safely
    const getTileSafe = (nx: number, ny: number) => {
      if (ny < 0 || ny >= height || nx < 0 || nx >= width) return TILE_WALL
      return dungeonMap[ny][nx]
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = dungeonMap[y][x]
        const isTileOpaque = localIsOpaque(tile, x, y)
        
        // If this tile is opaque (Wall, Closed Door, Hidden Secret Door), we don't render its floor/ceiling
        // and we don't cast walls outward. Walls are cast inward from transparent tiles.
        if (isTileOpaque) continue
        if (!exploredTiles[`${x},${y}`]) continue

        // Floor
        elements.push(
          <mesh key={`floor-${x}-${y}`} position={[x * TILE_SIZE + TILE_SIZE / 2, 0, y * TILE_SIZE + TILE_SIZE / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
            <meshStandardMaterial map={floorTexture} />
          </mesh>
        )
        key++

        // Ceiling
        elements.push(
          <mesh key={`ceil-${x}-${y}`} position={[x * TILE_SIZE + TILE_SIZE / 2, WALL_HEIGHT, y * TILE_SIZE + TILE_SIZE / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
            <meshStandardMaterial map={ceilingTexture} />
          </mesh>
        )
        key++

        // Helper to render wall segment
        const renderWall = (nx: number, ny: number, pos: [number, number, number], args: [number, number, number]) => {
          const neighbor = getTileSafe(nx, ny)
          if (localIsOpaque(neighbor, nx, ny)) {
            const tex = isDoor(neighbor) ? doorTexture : wallTexture
            elements.push(
              <mesh key={`wall-${x}-${y}-${nx}-${ny}`} position={pos}>
                <boxGeometry args={args} />
                <meshStandardMaterial map={tex} />
              </mesh>
            )
            key++
          }
        }

        // North edge (y-1)
        renderWall(x, y - 1, [x * TILE_SIZE + TILE_SIZE / 2, WALL_HEIGHT / 2, y * TILE_SIZE], [TILE_SIZE, WALL_HEIGHT, WALL_THICKNESS])
        // South edge (y+1)
        renderWall(x, y + 1, [x * TILE_SIZE + TILE_SIZE / 2, WALL_HEIGHT / 2, y * TILE_SIZE + TILE_SIZE], [TILE_SIZE, WALL_HEIGHT, WALL_THICKNESS])
        // West edge (x-1)
        renderWall(x - 1, y, [x * TILE_SIZE, WALL_HEIGHT / 2, y * TILE_SIZE + TILE_SIZE / 2], [WALL_THICKNESS, WALL_HEIGHT, TILE_SIZE])
        // East edge (x+1)
        renderWall(x + 1, y, [x * TILE_SIZE + TILE_SIZE, WALL_HEIGHT / 2, y * TILE_SIZE + TILE_SIZE / 2], [WALL_THICKNESS, WALL_HEIGHT, TILE_SIZE])
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
            position={[enemy.tileX * TILE_SIZE + TILE_SIZE / 2, 1.2, enemy.tileY * TILE_SIZE + TILE_SIZE / 2]}
            color={ENEMY_COLORS[enemy.name] ?? '#c44'}
            label={enemy.name}
          />
        )),
    [enemies],
  )

  const itemPrimitives = useMemo(
    () =>
      mapItems.map((mapItem) => (
        <ItemPrimitive key={`item-${mapItem.item.id}-${mapItem.tileX}-${mapItem.tileY}`} mapItem={mapItem} />
      )),
    [mapItems],
  )

  return <>{meshes}{enemySprites}{itemPrimitives}</>
}
