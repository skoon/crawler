import {
  TILE_WALL,
  TILE_FLOOR,
  TILE_DOOR,
  TILE_STAIRS_UP,
  TILE_STAIRS_DOWN,
  TILE_DOOR_CLOSED,
  TILE_SECRET_DOOR,
  TILE_PRESSURE_PLATE,
  TILE_TELEPORTER,
  TILE_TRAP_HIDDEN,
  TILE_SWITCH,
} from '../types'

export function isWalkable(tile: number): boolean {
  return (
    tile === TILE_FLOOR ||
    tile === TILE_STAIRS_UP ||
    tile === TILE_STAIRS_DOWN ||
    tile === TILE_DOOR_CLOSED ||
    tile === TILE_DOOR ||
    tile === TILE_PRESSURE_PLATE ||
    tile === TILE_TELEPORTER ||
    tile === TILE_TRAP_HIDDEN ||
    tile === TILE_SWITCH
  )
}

export function isOpaque(tile: number): boolean {
  return (
    tile === TILE_WALL ||
    tile === TILE_DOOR_CLOSED ||
    tile === TILE_DOOR ||
    tile === TILE_SECRET_DOOR
  )
}

export function isSolid(tile: number): boolean {
  return tile === TILE_WALL || tile === TILE_SECRET_DOOR || tile === TILE_DOOR_CLOSED
}

export function isDoor(tile: number): boolean {
  return tile === TILE_DOOR || tile === TILE_DOOR_CLOSED
}

export function isStairs(tile: number): boolean {
  return tile === TILE_STAIRS_UP || tile === TILE_STAIRS_DOWN
}

export function isTrap(tile: number): boolean {
  return tile === TILE_TRAP_HIDDEN
}

export function isTeleporter(tile: number): boolean {
  return tile === TILE_TELEPORTER
}

export function isPressurePlate(tile: number): boolean {
  return tile === TILE_PRESSURE_PLATE
}

export function isSwitch(tile: number): boolean {
  return tile === TILE_SWITCH
}

export function getTile(map: number[][], x: number, y: number): number {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
    return TILE_WALL
  }
  return map[y][x]
}
