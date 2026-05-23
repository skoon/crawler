export type EquipSlot = 'weapon' | 'armor' | 'shield' | 'ring1' | 'ring2';

export interface PartyMember {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  xp: number;
  status: string[];
  equipment: Partial<Record<EquipSlot, Item>>;
}

export interface TilePosition {
  x: number;
  y: number;
}

export interface LevelTransition {
  tileX: number;
  tileY: number;
  targetLevelId: string;
  targetPosition: TilePosition;
  targetFacing: number;
}

export interface LevelData {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][];
  startPosition: TilePosition;
  startFacing: number;
  encounters: EncounterTrigger[];
  items: MapItem[];
  transitions?: LevelTransition[];
  floorTexture?: string;
  wallTexture?: string;
}

export interface LevelScopedState {
  exploredTiles: Record<string, boolean>;
  doorStates: Record<string, boolean>;
  secretDoorsRevealed: Record<string, boolean>;
  encounterTriggers: EncounterTrigger[];
  mapItems: MapItem[];
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  thac0: number;
  damage: string;
  damageBonus: number;
  xp: number;
  tileX: number;
  tileY: number;
}

export interface EncounterTrigger {
  x: number;
  y: number;
  enemies: Omit<Enemy, 'id' | 'tileX' | 'tileY'>[];
}

export type CombatState = 'idle' | 'playerTurn' | 'enemyTurn' | 'victory' | 'defeat';

export type ItemType = 'weapon' | 'armor' | 'shield' | 'ring' | 'potion' | 'scroll' | 'key' | 'misc';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  weight: number;
  description: string;
  effects: Partial<{
    hpBonus: number;
    acBonus: number;
    strBonus: number;
    dexBonus: number;
    conBonus: number;
    damageBonus: number;
    damageDice: string;
  }>;
  consumable: boolean;
}

export interface MapItem {
  item: Item;
  tileX: number;
  tileY: number;
}

export interface GameState {
  party: PartyMember[];
  selectedMemberIndex: number;
  playerPosition: TilePosition;
  playerFacing: number;
  dungeonMap: number[][];
  floorTexture?: string;
  wallTexture?: string;
  log: string[];
  combatState: CombatState;
  enemies: Enemy[];
  encounterTriggers: EncounterTrigger[];
  currentTargetEnemyId: string | null;
  defendingMemberIds: string[];

  selectMember: (index: number) => void;
  addLogMessage: (message: string) => void;
  setPlayerPosition: (pos: TilePosition) => void;
  setPlayerFacing: (facing: number) => void;
  startCombat: (enemies: Enemy[]) => void;
  endCombat: () => void;
  setCombatState: (state: CombatState) => void;
  setCurrentTargetEnemyId: (id: string | null) => void;
  damageEnemy: (id: string, amount: number) => void;
  damageMember: (index: number, amount: number) => void;
  setDefending: (memberIndex: number, defending: boolean) => void;
  moveEnemy: (id: string, x: number, y: number) => void;
  doorStates: Record<string, boolean>;
  toggleDoor: (x: number, y: number) => void;
  secretDoorsRevealed: Record<string, boolean>;
  revealSecretDoor: (x: number, y: number) => void;
  exploredTiles: Record<string, boolean>;
  exploreTile: (x: number, y: number) => void;
  exploreRadius: (centerX: number, centerY: number, radius: number) => void;
  mapItems: MapItem[];
  inventory: Item[];
  pickupItem: (tileX: number, tileY: number) => void;
  removeMapItem: (tileX: number, tileY: number) => void;
  addToInventory: (item: Item) => void;
  equipItem: (memberIndex: number, slot: EquipSlot, item: Item) => void;
  unequipItem: (memberIndex: number, slot: EquipSlot) => void;
  useItem: (itemId: string, memberIndex: number) => void;

  currentLevelId: string;
  levels: Record<string, LevelData>;
  perLevelStates: Record<string, LevelScopedState>;
  changeLevel: (levelId: string, entry: TilePosition, facing: number) => void;
  loadLevel: (level: LevelData) => void;
}

export const TILE_WALL = 0;
export const TILE_FLOOR = 1;
export const TILE_DOOR = 2;
export const TILE_PIT = 3;
export const TILE_STAIRS_UP = 4;
export const TILE_STAIRS_DOWN = 5;
export const TILE_DOOR_CLOSED = 6;
export const TILE_SECRET_DOOR = 7;

export const TILE_SIZE = 2.25;
