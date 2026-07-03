export type EquipSlot = 'weapon' | 'armor' | 'shield' | 'ring1' | 'ring2';

export interface PartyMember {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
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
  trapConfig?: Record<string, TrapConfig>;
  triggerLinks?: TriggerLink[];
  teleporters?: Record<string, TeleportDestination>;
  npcs?: NPC[];
}

export interface ModuleManifest {
  schemaVersion: number;
  name: string;
  version: string;
  author?: string;
  description?: string;
  entryLevelId: string;
  levels: string[]; // relative paths to level JSON files inside the module
  textures?: string[]; // relative paths to bundled texture files
}

export interface DungeonModule {
  manifest: ModuleManifest;
  levels: LevelData[];
}

export interface LevelScopedState {
  exploredTiles: Record<string, boolean>;
  doorStates: Record<string, boolean>;
  secretDoorsRevealed: Record<string, boolean>;
  encounterTriggers: EncounterTrigger[];
  mapItems: MapItem[];
  triggerStates: Record<string, boolean>;
  switchStates: Record<string, boolean>;
  npcs: NPC[];
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
    mpRestore: number;
    acBonus: number;
    strBonus: number;
    dexBonus: number;
    conBonus: number;
    damageBonus: number;
    damageDice: string;
    torchRefill: number;
  }>;
  consumable: boolean;
}

export interface MapItem {
  item: Item;
  tileX: number;
  tileY: number;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  targetType: 'enemy' | 'ally' | 'all_enemies' | 'self';
  allowedClasses: string[];
}

export interface SpellResult {
  damage?: number;
  healing?: number;
  statusEffectType?: string;
  statusDuration?: number;
  logMessage: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  targetId: string;
  targetType: 'enemy' | 'party_member';
  duration: number;
  type: 'poison' | 'paralysis' | 'burn' | 'sleep' | 'haste' | 'shield';
}

export interface DialogueChoice {
  text: string;
  nextNodeId: string | null; // null ends conversation
  action?: 'open_shop' | 'heal_party';
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
}

export interface NPC {
  id: string;
  name: string;
  tileX: number;
  tileY: number;
  dialogueStartNodeId: string;
  dialogueNodes: Record<string, DialogueNode>;
  shopItems?: string[]; // list of item IDs this merchant currently has in stock
  color?: string; // custom billboard color (e.g. Hex string)
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

  torchDuration: number;      // seconds of light remaining
  maxTorchDuration: number;   // seconds a full torch lasts
  isResting: boolean;
  restTimer: number;          // seconds spent in the current rest
  tickTorch: (deltaSeconds: number) => void;
  refillTorch: (seconds: number) => void;
  startRest: () => void;
  stopRest: () => void;
  tickRest: (deltaSeconds: number) => void;

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

  activeStatusEffects: StatusEffect[];

  gold: number;
  activeNpcId: string | null;
  currentDialogueNodeId: string | null;
  showShop: boolean;
  npcs: NPC[];

  spendMp: (memberIndex: number, amount: number) => void;
  restoreMp: (memberIndex: number, amount: number) => void;
  addStatusEffect: (effect: StatusEffect) => void;
  removeStatusEffect: (effectId: string) => void;

  currentLevelId: string;
  levels: Record<string, LevelData>;
  perLevelStates: Record<string, LevelScopedState>;
  changeLevel: (levelId: string, entry: TilePosition, facing: number) => void;
  loadLevel: (level: LevelData) => void;
  registerLevel: (level: LevelData) => void;
  loadModule: (levels: LevelData[], entryLevelId: string) => void;

  triggerStates: Record<string, boolean>;
  switchStates: Record<string, boolean>;
  activateTrigger: (x: number, y: number) => void;
  toggleSwitch: (x: number, y: number) => void;
  damagePartyAll: (amount: number) => void;

  startDialogue: (npcId: string) => void;
  chooseDialogueOption: (choice: DialogueChoice) => void;
  endDialogue: () => void;
  buyItem: (itemId: string, price: number) => void;
  sellItem: (itemId: string, price: number) => void;
}

export const TILE_WALL = 0;
export const TILE_FLOOR = 1;
export const TILE_DOOR = 2;
export const TILE_PIT = 3;
export const TILE_STAIRS_UP = 4;
export const TILE_STAIRS_DOWN = 5;
export const TILE_DOOR_CLOSED = 6;
export const TILE_SECRET_DOOR = 7;
export const TILE_PRESSURE_PLATE = 8;
export const TILE_TELEPORTER = 9;
export const TILE_TRAP_HIDDEN = 10;
export const TILE_SWITCH = 11;

export const TILE_SIZE = 2.25;

export interface TriggerLink {
  triggerX: number;
  triggerY: number;
  triggerType: 'pressure_plate' | 'switch';
  action: 'open_door' | 'close_door' | 'reveal_secret_door' | 'damage';
  targetX: number;
  targetY: number;
  damageAmount?: number;
  damageDice?: string;
}

export interface TrapConfig {
  damageAmount: number;
  statusEffect?: string;
  statusDuration?: number;
  logMessage: string;
}

export interface TeleportDestination {
  targetX: number;
  targetY: number;
  targetFacing: number;
}
