import {
  TILE_WALL,
  TILE_FLOOR,
  TILE_DOOR,
  TILE_STAIRS_UP,
  TILE_STAIRS_DOWN,
  TILE_DOOR_CLOSED,
  TILE_SECRET_DOOR,
} from '../types'

export function isWalkable(tile: number): boolean {
  return (
    tile === TILE_FLOOR ||
    tile === TILE_STAIRS_UP ||
    tile === TILE_STAIRS_DOWN ||
    tile === TILE_DOOR_CLOSED ||
    tile === TILE_DOOR
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
  return tile === TILE_WALL || tile === TILE_SECRET_DOOR
}

export function isDoor(tile: number): boolean {
  return tile === TILE_DOOR || tile === TILE_DOOR_CLOSED
}

export function getTile(map: number[][], x: number, y: number): number {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
    return TILE_WALL
  }
  return map[y][x]
}
