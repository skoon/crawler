# Dungeon Crawler — Eye of the Beholder-style

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| Language | TypeScript |
| UI Framework | React |
| 3D Rendering | Three.js via `@react-three/fiber` + `@react-three/drei` |
| State Management | Zustand |
| Layout | CSS Grid (3 panes) |

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Left Pane          │  Center Pane    │  Right Pane         │
│  (Party Members)    │  (3D Dungeon)   │  (Stats / Inventory │
│                     │                 │   / Adventure Log)  │
│  Portraits          │  First-person   │  Selected char      │
│  Names              │  tile-based     │  stats sheet        │
│  HP bars            │  view with      │  Item grid          │
│  Status icons       │  Three.js       │  Scrollable log     │
│                     │                 │                     │
└─────────────────────────────────────────────────────────────┘
```

## Movement System

Tile-based grid movement — classic EoB style.
- Up/Down: step forward / backward one tile
- Left/Right: rotate 90°
- Shift+Left/Right: strafe
- Smooth lerp animation between tiles

---

## Milestones

### M1 — Project Scaffold & Pane Layout
- Scaffold Vite + React + TypeScript project
- Integrate Three.js via `@react-three/fiber` + `@react-three/drei`
- Create 3-pane CSS Grid layout (Party | 3D View | Stats/Log)
- Set up Zustand store foundation with basic game state shape

#### M1 Prompts

##### Prompt 1 — Scaffold the Vite + React + TS project

```
Scaffold a new Vite project with the React + TypeScript template in the current directory.

Steps:
1. Run `npm create vite@latest . -- --template react-ts` (force overwrite if prompted)
2. Run `npm install`
3. Clean up the template: remove `App.css` contents, remove the Vite/React boilerplate from `App.tsx` (leave a bare component returning an empty `<div>`), and remove `index.css` contents (leave it empty)
4. Verify the project compiles with `npm run build`

Only output the commands you run and confirmation of success.
```

##### Prompt 2 — Install Three.js dependencies and add a Canvas placeholder

```
Install Three.js, @react-three/fiber, and @react-three/drei into the project.

Steps:
1. Run `npm install three @react-three/fiber @react-three/drei`
2. In `src/App.tsx`, import `Canvas` from `@react-three/fiber`
3. Below the main div placeholder, add a `<Canvas>` containing a simple `<mesh>` with `<boxGeometry>` and `<meshStandardMaterial>`, plus `<ambientLight>` so it's visible
4. Give the Canvas a fixed size (e.g. width 400px, height 400px) using inline styles or a wrapper div
5. Verify with `npm run dev` (check for compilation, don't need to open browser)
```

##### Prompt 3 — Create the 3-pane CSS Grid layout

```
Replace the App.tsx content with a three-pane layout using CSS Grid.

Requirements:
- Left pane: party members (width ~200px)
- Center pane: 3D view (flexible, takes remaining space)
- Right pane: stats/inventory/log (width ~280px)
- Full viewport height layout
- Dark background theme (dark gray/black) with panel borders

Implementation:
1. Replace App.tsx:
   - Import a new CSS file `src/App.css`
   - Render three `<div>` sections inside a grid container:
     - `<aside className="pane pane-left">` — text "Party Members"
     - `<main className="pane pane-center">` — contains the `<Canvas>` from prompt 2
     - `<aside className="pane pane-right">` — text "Stats / Inventory / Log"
   - Each pane should show its label text centered

2. Create `src/App.css`:
   - `.app` container: `display: grid; grid-template-columns: 200px 1fr 280px; height: 100vh;`
   - `.pane`: `background: #1a1a1a; border: 1px solid #333; color: #ccc;`
   - `.pane-left`, `.pane-right`: `padding: 8px; overflow-y: auto;`
   - `.pane-center`: `position: relative;` (the Canvas fills this pane)
   - Make the Canvas wrapper inside pane-center fill its parent with `width: 100%; height: 100%`
   - Body/html: `margin: 0; padding: 0; overflow: hidden; background: #111;`

3. In `src/index.css`, reset body margin and html height.

4. Verify with `npm run build`.
```

##### Prompt 4 — Set up Zustand store with game state types

```
Install Zustand and define the core game store with TypeScript types.

Steps:
1. Run `npm install zustand`
2. Create `src/types.ts` with these interfaces:

```typescript
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
}

export interface TilePosition {
  x: number;
  y: number;
}

export interface GameState {
  party: PartyMember[];
  selectedMemberIndex: number;
  playerPosition: TilePosition;
  playerFacing: number; // 0=North, 1=East, 2=South, 3=West
  dungeonMap: number[][];
  log: string[];

  // Actions
  selectMember: (index: number) => void;
  addLogMessage: (message: string) => void;
  setPlayerPosition: (pos: TilePosition) => void;
  setPlayerFacing: (facing: number) => void;
}

export type TileType = typeof TILE_WALL | typeof TILE_FLOOR | typeof TILE_DOOR;

export const TILE_WALL = 0;
export const TILE_FLOOR = 1;
export const TILE_DOOR = 2;
```

3. Create `src/store.ts`:
   - Import `create` from `zustand`
   - Import types from `./types`
   - Implement the store with initial state:
     - `party`: array of 4 placeholder PartyMember objects (Fighter, Mage, Cleric, Thief) with reasonable stats (e.g. Fighter: str 16, con 14, hp 12; Mage: int 17, con 10, hp 6; etc.)
     - `selectedMemberIndex`: 0
     - `playerPosition`: `{ x: 1, y: 1 }`
     - `playerFacing`: 0
     - `dungeonMap`: a 12x12 grid array where edges are walls and interior has a simple room layout (use 0 for wall, 1 for floor)
     - `log`: `["Welcome to the dungeon."]`
   - Implement all action functions listed in the interface

4. Verify with `npm run build`.
```

### M2 — Dungeon Data Model & Map Parser
- Define tile types enum: `Wall`, `Floor`, `Door`, `Pit`, `Stairs`
- 2D grid data structure (`number[][]` mapped from tile enums)
- JSON map format and a loader utility
- Build a sample 12×12 dungeon map with rooms, corridors, and a few doors

#### M2 Prompts

##### Prompt 1 — Expand tile types and add map utilities

```
Expand the tile type system and create utility functions for map queries.

Steps:
1. Edit `src/types.ts`:
   - Add new tile constants:
     ```typescript
     export const TILE_PIT = 3;
     export const TILE_STAIRS_UP = 4;
     export const TILE_STAIRS_DOWN = 5;
     export const TILE_DOOR_CLOSED = 6;
     ```
   - Add a `MapData` interface:
     ```typescript
     export interface MapData {
       width: number;
       height: number;
       tiles: number[][];
       startPosition: TilePosition;
       startFacing: number;
       name: string;
     }
     ```

2. Create `src/map/mapUtils.ts`:
   - Import tile constants from `../types`
   - Export `isWalkable(tile: number): boolean` — returns true for FLOOR, STAIRS, DOOR_CLOSED (can walk through once opened); false for WALL, PIT
   - Export `isOpaque(tile: number): boolean` — returns true for WALL, DOOR_CLOSED; false for FLOOR, PIT, STAIRS
   - Export `isSolid(tile: number): boolean` — returns true for WALL; false for FLOOR, PIT, STAIRS, DOOR_CLOSED
   - Export `getTile(map: number[][], x: number, y: number): number` — returns TILE_WALL if coordinates are out of bounds, otherwise the tile at that position

3. Verify with `npm run build`.
```

##### Prompt 2 — Build a sample dungeon map

```
Create a hand-crafted 12×12 sample dungeon with rooms, corridors, and doors.

1. Create `src/map/sampleDungeon.ts`:
   - Import tile constants from `../types` and `MapData` type
   - Build a `sampleDungeon: MapData` export with this layout (y=0 is top row):

```
Row  0:  W  W  W  W  W  W  W  W  W  W  W  W
Row  1:  W  F  F  F  F  W  F  F  F  F  F  W
Row  2:  W  F  F  F  F  W  F  F  F  F  F  W
Row  3:  W  F  F  F  F  D  F  F  F  F  F  W
Row  4:  W  F  F  F  F  W  F  F  F  F  F  W
Row  5:  W  W  W  W  W  W  W  W  P  W  W  W
Row  6:  W  F  F  F  F  F  F  F  F  F  F  W
Row  7:  W  F  F  F  F  F  F  F  F  F  F  W
Row  8:  W  F  F  F  F  F  F  F  F  F  F  W
Row  9:  W  F  F  F  F  F  F  F  F  F  F  W
Row 10:  W  F  F  F  F  F  F  F  F  F  F  W
Row 11:  W  W  W  W  W  W  W  W  W  W  W  W
```

Legend: W=WALL, F=FLOOR, D=DOOR_CLOSED, P=PIT

   - Set `startPosition: { x: 2, y: 2 }` and `startFacing: 0` (north)
   - Set `name: 'The Catacombs'`

2. Update `src/store.ts`:
   - Replace `createSampleMap()` with an import of `sampleDungeon` from `./map/sampleDungeon`
   - Change `dungeonMap` initial value to `sampleDungeon.tiles`
   - Change `playerPosition` initial value to `sampleDungeon.startPosition`
   - Change `playerFacing` initial value to `sampleDungeon.startFacing`

3. Verify with `npm run build`.
```

### M3 — 3D Dungeon Rendering
- Scene, camera, and renderer mounted in the center pane via `Canvas`
- Render walls as box geometries with textured/colored faces
- Floor tiles and ceiling tiles with distinct materials
- Camera locked to tile grid at eye height
- Support camera rotation in 90° increments (quaternion snapping)

#### M3 Prompts

##### Prompt 1 — Create DungeonView component with floor, ceiling, and wall geometry

```
Create a DungeonView component that renders the dungeon map in 3D.

1. Create `src/components/DungeonView.tsx`:
   - Import `useGameStore` from `../store`
   - Import `isOpaque` from `../map/mapUtils`
   - Import tile constants from `../types`
   - Read `dungeonMap` from the store
   - The render approach:
     - Iterate through every tile in the map
     - For every tile that is NOT a wall:
       - Render a `<mesh>` with `<planeGeometry>` at y=0 (floor) and y=3 (ceiling height), rotated -90° on X for floor, 90° on X for ceiling
       - Floor color: `#444` (dark gray), Ceiling color: `#222`
     - For every tile, check its 4 neighbors (north, south, east, west). If the neighbor tile IS opaque and the current tile is NOT opaque (or vice versa), render a wall segment:
       - A wall is a `<mesh>` with `<boxGeometry>` sized `1 × 3 × 0.1`, positioned at the shared edge between the two tiles
       - Position the wall at the midpoint of the edge
       - Wall color: `#666` with slight variation per wall (`#5a5a5a` to `#727272`)
     - Skip rendering walls on the outer edges of the map (they'll never be seen)

2. Create `src/components/DungeonViewCamera.tsx`:
   - Import `useGameStore` from `../store`
   - Import `useFrame`, `useThree` from `@react-three/fiber`
   - Read `playerPosition` and `playerFacing` from the store
   - Position the camera at `(playerPosition.x + 0.5, 1.6, playerPosition.y + 0.5)` — center of the tile at eye height
   - Set camera rotation based on playerFacing: 0=North (`[0, 0, 0]`), 1=East (`[0, Math.PI / 2, 0]`), 2=South (`[0, Math.PI, 0]`), 3=West (`[0, -Math.PI / 2, 0]`)
   - Use `useFrame` to smoothly lerp camera position and rotation each frame (lerp factor ~0.1)

3. Update `src/App.tsx`:
   - Import `DungeonView` from `./components/DungeonView`
   - Import `DungeonViewCamera` from `./components/DungeonViewCamera`
   - Inside the `<Canvas>`, replace the orange box mesh with `<DungeonView />` and `<DungeonViewCamera />`
   - Add `<directionalLight position={[5, 10, 5]} intensity={0.8} />` and keep `<ambientLight>`

4. Verify with `npm run build`.
```

### M4 — Grid-Based Movement & Collision
- Keyboard input handler (WASD + arrows + shift modifiers)
- Snap camera to tile centers after each movement step
- Wall collision: reject movement attempts into `Wall` tiles
- Smooth 200ms lerp animation for camera translation and rotation

#### M4 Prompts

##### Prompt 1 — Keyboard input hook and movement system

```
Create a keyboard input system that handles movement and rotation with wall collision.

1. Create `src/hooks/useKeyboard.ts`:
   - Use `useEffect` to attach `keydown` and `keyup` listeners to `window`
   - Track pressed keys in a `Set<string>` ref
   - On mount, add event listeners for `keydown` and `keyup`
   - On unmount, remove the listeners
   - Return the set of currently pressed keys

2. Create `src/systems/movement.ts`:
   - Import `useGameStore` from `../store`
   - Import `isSolid`, `getTile` from `../map/mapUtils`
   - Export `useMovementSystem()` hook:
     - Call `useKeyboard()` to get pressed keys
     - Use `useEffect` that runs on a short interval (every 150ms) when movement keys are held, OR use `useFrame` from R3F (only run if a movement key is held)
     - Read `playerPosition`, `playerFacing`, `dungeonMap` from the store
     - If Up/W or Down/S is held:
       - Calculate target tile based on playerFacing:
         - Facing 0 (North): target = `{ x, y: y - 1 }`
         - Facing 1 (East): target = `{ x: x + 1, y }`
         - Facing 2 (South): target = `{ x, y: y + 1 }`
         - Facing 3 (West): target = `{ x: x - 1, y }`
       - If Down/S (backward), reverse the direction
       - Call `getTile(map, target.x, target.y)` — if NOT solid, call `setPlayerPosition(target)`
     - If Left or Right is pressed (without Shift):
       - Turn: cycle playerFacing: `(facing + 1) % 4` for Right, `(facing + 3) % 4` for Left
       - Call `setPlayerFacing(newFacing)`
     - If Shift+Left or Shift+Right:
       - Strafe: calculate tile 90° left or right from current facing
       - Same collision check as forward/backward

3. Integrate the movement system — in `src/App.tsx`:
   - Import `useMovementSystem` from `./systems/movement`
   - Call `useMovementSystem()` inside the App component

4. Verify with `npm run build`.
```

### M5 — Party System UI
- Left pane renders character portraits, names, HP bars, status effect icons
- Click to select a character — propagates to the right pane
- Pre-roll a party of 4 adventurers (Fighter, Mage, Cleric, Thief)

#### M5 Prompts

##### Prompt 1 — Create PartyPane component for the left pane

```
Build the party member display in the left pane.

1. Create `src/components/PartyPane.tsx`:
   - Import `useGameStore` from `../store`
   - Read `party` and `selectedMemberIndex` from the store
   - Render a list of party members, each showing:
     - A colored box as a simple portrait (different color per class: Fighter=#c44, Mage=#44c, Cleric=#c84, Thief=#484)
     - Character name in bold
     - Class label in smaller gray text
     - HP bar: a div container (width 100%, height 12px, background #333) with an inner div showing `hp/maxHp` as percentage (green if >50%, yellow if >25%, red otherwise)
     - Any status effect strings (small italic text)
   - Highlight the selected member with a bright border (2px solid #888)
   - On click, call `selectMember(index)`

2. Update `src/App.tsx`:
   - Import `PartyPane` from `./components/PartyPane`
   - Replace the `<aside className="pane pane-left">Party Members</aside>` placeholder with `<PartyPane />`

3. Add styling — append to `src/App.css`:
   ```css
   .party-member {
     display: flex;
     align-items: center;
     gap: 8px;
     padding: 6px;
     margin-bottom: 4px;
     border: 2px solid transparent;
     border-radius: 4px;
     cursor: pointer;
     user-select: none;
   }
   .party-member:hover { background: #2a2a2a; }
   .party-member.selected { border-color: #888; background: #2a2a2a; }
   .party-portrait { width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; }
   .party-info { flex: 1; min-width: 0; }
   .party-name { font-weight: bold; font-size: 13px; color: #eee; }
   .party-class { font-size: 11px; color: #999; }
   .hp-bar-outer { width: 100%; height: 10px; background: #333; border-radius: 5px; margin-top: 3px; overflow: hidden; }
   .hp-bar-inner { height: 100%; border-radius: 5px; transition: width 0.3s; }
   .party-status { font-size: 11px; color: #e88; font-style: italic; margin-top: 2px; }
   .pane-left { padding: 8px; }
   ```

4. Verify with `npm run build`.
```

### M6 — Stats, Inventory & Log Pane
- Right pane with tabbed or vertically stacked sections
- **Stats:** full character sheet for the selected party member
- **Inventory:** visual item grid with slots (weapon, armor, shield, rings, potions, scrolls)
- **Log:** auto-scrolling readout of game messages (combat, item pickups, events)

#### M6 Prompts

##### Prompt 1 — Right pane with tabs and Stats content

```
Create the right pane with tab navigation and the Stats tab.

1. Create `src/components/RightPane.tsx`:
   - Use local state to track which tab is active: `'stats' | 'inventory' | 'log'`
   - Render tab buttons at the top (Stats, Inventory, Log) — active tab highlighted, inactive gray
   - Below the tabs, conditionally render the appropriate sub-component
   - Tab button styles: inline-block, padding 6px 12px, cursor pointer, color #999 for inactive, #eee for active, border-bottom 2px solid transparent vs #888

2. Create `src/components/StatsPane.tsx`:
   - Import `useGameStore` from `../store`
   - Read `party` and `selectedMemberIndex` from the store
   - Display the selected character's full stat sheet:
     - Name and class as a header
     - HP: `hp / maxHp`
     - AC, Level, XP
     - Attributes: STR, DEX, CON, INT, WIS, CHA (each on its own line with the value)
   - All text is #ccc on dark background, styled with consistent spacing

3. Update `src/App.tsx`:
   - Import `RightPane` from `./components/RightPane`
   - Replace `<aside className="pane pane-right">Stats / Inventory / Log</aside>` with `<RightPane />`

4. Verify with `npm run build`.
```

##### Prompt 2 — Inventory grid and Log display

```
Add the Inventory and Log tabs to the right pane.

1. Create `src/components/InventoryPane.tsx`:
   - Display a grid of item slots: the equipment slots at the top (Weapon, Armor, Shield, Ring1, Ring2) and a general inventory grid below
   - For now, each slot shows a bordered box with the slot name inside (e.g. "[Weapon]" or "[empty]")
   - Use a CSS grid with 2 columns for the general inventory
   - Slots use `background: #222; border: 1px solid #444; padding: 6px; border-radius: 3px;`

2. Create `src/components/LogPane.tsx`:
   - Import `useGameStore` from `../store`
   - Read `log` from the store
   - Render log entries in reverse chronological order (newest at bottom), using a scrollable container
   - Each entry is on its own line with font-size 12px, color #aaa
   - Use `useEffect` with a ref to auto-scroll to the bottom when new entries are added
   - Container has `max-height: calc(100vh - 120px); overflow-y: auto;`

3. Update `src/components/RightPane.tsx`:
   - Import `InventoryPane` from `./InventoryPane` and `LogPane` from `./LogPane`
   - Render `<InventoryPane />` when tab is `'inventory'`, `<LogPane />` when tab is `'log'`

4. Verify with `npm run build`.
```

### M7 — Combat System
- Place encounter triggers on the map (x,y coords with enemy roster)
- Turn-based loop: **Party phase** → **Enemy phase**
- Actions: Attack (melee/ranged), Cast Spell, Use Item, Defend
- To-hit: `THAC0 - target AC = minimum d20 roll needed`
- Damage: weapon dice + STR modifier
- Track enemy HP; remove on death; log all events

#### M7 Prompts

##### Prompt 1 — Enemy data, encounter triggers, and combat state machine

```
Set up the combat data model, encounter placement, and combat state machine in the store.

1. Edit `src/types.ts` — add these interfaces and types at the bottom:
   ```typescript
   export interface Enemy {
     id: string;
     name: string;
     hp: number;
     maxHp: number;
     ac: number;
     thac0: number;
     damage: string; // e.g. "1d6"
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

   export type CombatAction = 'attack' | 'defend' | 'useItem';
   ```
   - Add to `GameState`:
     ```typescript
     combatState: CombatState;
     enemies: Enemy[];
     encounterTriggers: EncounterTrigger[];
     currentTargetEnemyId: string | null;
     defendingMemberIds: string[];
     ```
   - Add action functions:
     ```typescript
     startCombat: (enemies: Enemy[]) => void;
     endCombat: () => void;
     setCombatState: (state: CombatState) => void;
     setCurrentTargetEnemyId: (id: string | null) => void;
     damageEnemy: (id: string, amount: number) => void;
     damageMember: (index: number, amount: number) => void;
     setDefending: (memberIndex: number, defending: boolean) => void;
     ```

2. Edit `src/map/sampleDungeon.ts`:
   - Add an `encounterTriggers` array as an additional export:
     ```typescript
     export const sampleEncounters: EncounterTrigger[] = [
       { x: 7, y: 3, enemies: [{ name: 'Goblin', hp: 6, maxHp: 6, ac: 13, thac0: 19, damage: '1d6', damageBonus: 0, xp: 15 }] },
       { x: 5, y: 8, enemies: [{ name: 'Skeleton', hp: 8, maxHp: 8, ac: 14, thac0: 18, damage: '1d8', damageBonus: 0, xp: 25 }] },
     ]
     ```

3. Edit `src/store.ts`:
   - Import `Enemy`, `EncounterTrigger`, `CombatState` from `./types`
   - Import `sampleEncounters` from `./map/sampleDungeon`
   - Add initial state for all new fields
   - Implement all new action functions

4. Create `src/systems/encounterCheck.ts`:
   - Export `useEncounterCheck()` hook
   - Subscribe to `playerPosition` from the store
   - When player position matches any encounter trigger position, call `startCombat()` with a copy of the enemies for that trigger (assign unique IDs and tile positions)
   - Remove the trigger so it can't re-trigger
   - Add a log message: "Ambush! [enemy names] appear!"

5. Wire the encounter check — in `src/App.tsx`, import and call `useEncounterCheck()`

6. Verify with `npm run build`.
```

##### Prompt 2 — Combat UI and action resolution

```
Build the combat UI overlay and the attack resolution system.

1. Create `src/components/CombatOverlay.tsx`:
   - Import `useGameStore` from `../store`
   - Read `combatState`, `enemies`, `party`, `selectedMemberIndex` from the store
   - Only render when `combatState !== 'idle'`
   - Show at the bottom of the center pane (overlaid on the 3D view):
     - Enemy list: each enemy name, HP bar, current target highlight
     - Action buttons row: [Attack] [Defend] [Use Item]
     - Clicking an enemy calls `setCurrentTargetEnemyId(enemy.id)`
     - Clicking [Attack] resolves the attack (see step 2)
     - [Defend] calls `setDefending(selectedMemberIndex, true)` and ends turn
   - When all enemies are dead, show a "Victory!" message and call `endCombat()` after 2 seconds

2. Create `src/systems/combatResolution.ts`:
   ```typescript
   // Roll a d20 (1-20)
   function rollD20(): number {
     return Math.floor(Math.random() * 20) + 1;
   }

   // Roll dice notation like "1d6" or "2d4"
   function rollDice(notation: string): number {
     const [count, sides] = notation.split('d').map(Number);
     let total = 0;
     for (let i = 0; i < count; i++) {
       total += Math.floor(Math.random() * sides) + 1;
     }
     return total;
   }

   // Resolve a party member's attack against a target enemy
   // Returns { hit: boolean, damage: number }
   export function resolvePlayerAttack(attackerAC: number, attackerStr: number, targetAC: number, targetThac0: number): { hit: boolean; damage: number }
   // Use THAC0 system: attacker's THAC0 is calculated from class/level (simplified: base 19)
   // To-hit: roll d20 + attack bonus >= target AC
   // Damage: roll damage dice + STR modifier
   ```

   Place this function in the combat overay for now, or export it from a shared location.

3. Update `src/components/CombatOverlay.tsx`:
   - On [Attack] click: call `resolvePlayerAttack`, apply damage via `damageEnemy`, log the result, then switch combat state to `'enemyTurn'`
   - On `'enemyTurn'`: after a 1-second delay, each alive enemy attacks a random party member (for now), then switch back to `'playerTurn'`
   - Use `setTimeout` for the enemy turn delay
   - On member HP reaching 0, add status 'Unconscious'

4. Update `src/App.tsx`:
   - Import `CombatOverlay` from `./components/CombatOverlay`
   - Place `<CombatOverlay />` inside the center pane `<div>`, after the `<Canvas>` (it'll render on top)

5. Verify with `npm run build`.
```

### M8 — Enemy AI & 3D Enemy Rendering
- Enemy data model: `{ name, hp, ac, thac0, damage, sprite }`
- Place enemy entities on map tiles
- Render as billboard sprites (always face camera) in the Three.js scene
- AI logic: if adjacent → attack, else → move toward party (BFS shortest path)
- Death: fade-out animation and tile cleanup

#### M8 Prompts

##### Prompt 1 — 3D enemy rendering on the map

```
Render enemies as billboard sprites in the 3D dungeon view.

1. Create `src/components/EnemySprite.tsx`:
   - Import `useGameStore` from `../store`
   - Import `Sprite`, `useSprite` from `@react-three/drei` (for billboard sprites)
   - Read `enemies` from the store
   - For each alive enemy (hp > 0), render a `<Sprite>` at position `(enemy.tileX + 0.5, 1.5, enemy.tileY + 0.5)` 
   - Since we don't have actual sprite textures, use `<Text>` from `@react-three/drei` to display the first letter of the enemy name in red, inside a `<mesh>` with a colored plane as the sprite face
   - Alternative simpler approach: render a `<mesh>` with `<planeGeometry>` that always faces the camera (implement manually using `lookAt` in `useFrame`), colored with the enemy color (red for goblin, bone for skeleton), with the enemy name rendered via `@react-three/drei`'s `<Text>` component positioned slightly above

2. Create `src/components/EnemyBillboard.tsx` (alternative simple approach):
   - Props: `position: [number, number, number]`, `color: string`, `label: string`
   - Render a `<mesh>` with `<planeGeometry args={[0.8, 1.2]}>` and `<meshBasicMaterial color={color}>` at the given position
   - Use `useFrame` to make the plane always face the camera: read the camera position from `useThree()` and set the mesh's `lookAt` to the camera position each frame
   - Place a `<Text>` from `@react-three/drei` in front of the billboard showing the label

3. Update `src/components/DungeonView.tsx`:
   - Import `EnemyBillboard` from `./EnemyBillboard`
   - Import `useGameStore` from `../store`
   - Read `enemies` from the store
   - For each alive enemy, render `<EnemyBillboard position={[enemy.tileX + 0.5, 1.2, enemy.tileY + 0.5]} color="#c44" label={enemy.name} />`
   - Wrap in a separate `useMemo` block keyed on enemies

4. Verify with `npm run build`.
```

##### Prompt 2 — Enemy AI with BFS pathfinding and combat integration

```
Add pathfinding AI so enemies move toward the party and attack when adjacent.

1. Create `src/systems/enemyAI.ts`:
   - Export `findPath(map: number[][], startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[]`
   - BFS implementation:
     - Use a queue starting from `(startX, startY)`
     - Track visited nodes and parent pointers
     - Expand in 4 cardinal directions (north, south, east, west)
     - Only walkable tiles (isWalkable) can be traversed
     - Stop when reaching `(endX, endY)`
     - Reconstruct path from parent pointers
     - Return empty array if no path found

2. Update `src/systems/enemyAI.ts` — add the turn processing:
   - Export `processEnemyTurn()`:
     - Read `enemies`, `playerPosition`, `dungeonMap` from the store
     - For each alive enemy:
       - Check if the enemy is adjacent to the player (Manhattan distance = 1)
       - If adjacent: deal damage to the player (roll enemy's damage dice + bonus) and log
       - If not adjacent: find path to player position. If path has at least 2 steps, move enemy to the first step (path[1], since path[0] is current position)
       - Update enemy's tileX/tileY in the store via a new action `moveEnemy(enemyId, x, y)`

3. Update `src/store.ts`:
   - Add action: `moveEnemy: (id: string, x: number, y: number) => void`
   - Implement it: find the enemy in the array, update tileX/tileY

4. Update `src/components/CombatOverlay.tsx`:
   - Import `processEnemyTurn` from `../systems/enemyAI`
   - In the `'enemyTurn'` handler, call `processEnemyTurn()` instead of the placeholder random attack
   - After processing all enemies, switch to `'playerTurn'`

5. Verify with `npm run build`.
```

### M9 — Items & Pickups
- Item data model: `{ name, type, weight, effects, sprite }`
- Place items on map tiles (floating 3D billboard or geometry)
- Walk over item → auto-pickup prompt or auto-loot
- Inventory management: equip/unequip, update derived stats (AC, damage)
- Consumable items: healing potions, keys for doors

#### M9 Prompts

##### Prompt 1 — Item data model, map items, and pickup system

```
Define the item system, place items on the map, and implement pickup on walkover.

1. Edit `src/types.ts` — add:
   ```typescript
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
   ```
   - Add to `GameState`:
     ```typescript
     mapItems: MapItem[];
     inventory: Item[];
     ```
   - Add actions:
     ```typescript
     pickupItem: (tileX: number, tileY: number) => void;
     removeMapItem: (tileX: number, tileY: number) => void;
     addToInventory: (item: Item) => void;
     ```

2. Edit `src/map/sampleDungeon.ts`:
   - Add a `sampleMapItems` export with a few placed items:
     ```typescript
     export const sampleMapItems: MapItem[] = [
       {
         item: { id: 'short-sword', name: 'Short Sword', type: 'weapon', weight: 3, description: 'A sharp iron blade', effects: { damageDice: '1d6', damageBonus: 0 }, consumable: false },
         tileX: 3, tileY: 2,
       },
       {
         item: { id: 'healing-potion', name: 'Healing Potion', type: 'potion', weight: 0.5, description: 'Restores 2d4 HP', effects: { hpBonus: 0 }, consumable: true },
         tileX: 8, tileY: 7,
       },
       {
         item: { id: 'leather-armor', name: 'Leather Armor', type: 'armor', weight: 10, description: 'Hardened leather protection', effects: { acBonus: 2 }, consumable: false },
         tileX: 4, tileY: 9,
       },
     ]
     ```

3. Edit `src/store.ts`:
   - Import `MapItem`, `Item` from `./types` and `sampleMapItems` from `./map/sampleDungeon`
   - Add initial state: `mapItems: sampleMapItems`, `inventory: []`
   - Implement `pickupItem`: find matching mapItem at tileX/tileY, add to inventory, remove from mapItems, log "[Item] picked up"
   - Implement `removeMapItem`: filter out the item at given coordinates
   - Implement `addToInventory`: push item to inventory array

4. Create `src/systems/itemPickup.ts`:
   - Export `useItemPickup()` hook
   - Subscribe to `playerPosition` from the store
   - When playerPosition changes, check if any mapItem exists at the player's tile
   - If found, call `pickupItem` from the store
   - Optional: add a 500ms cooldown to prevent double-pickup

5. Update `src/App.tsx`:
   - Import and call `useItemPickup()`

6. Verify with `npm run build`.
```

##### Prompt 2 — Inventory UI, equip/use, and stat changes

```
Build the full inventory UI with equip/use functionality and stat tracking.

1. Update `src/components/InventoryPane.tsx`:
   - Import `useGameStore` from `../store`
   - Read `inventory` and `party` and `selectedMemberIndex` from the store
   - Display two sections:
     - **Equipped Slots:** Weapon, Armor, Shield, Ring 1, Ring 2 — for now empty/dimmed
     - **Backpack:** grid of all items in inventory, each showing item name and type
   - Each item in the backpack shows: name, type icon (short text like [W], [A], [P]), weight
   - Add a placeholder section at the bottom showing total inventory weight
   - Style with small item cards: `background: #222; border: 1px solid #444; border-radius: 3px; padding: 4px 8px; margin: 2px;`

2. Update `src/components/StatsPane.tsx`:
   - Read inventory from store
   - Calculate and display total AC bonus from equipped items (for now just sum of all item effects.acBonus — simplified)
   - Show base AC and modified AC (base + equipment bonus)

3. Verify with `npm run build`.
```

### M10 — Doors & Secret Doors
- Door tile: interact with Space/Enter to toggle open/closed
- 3D door geometry with hinge rotation animation
- Secret doors: highlight prompt when walking adjacent, then interact to open
- Block line-of-sight and movement when closed, passable when open

#### M10 Prompts

##### Prompt 1 — Door interaction and 3D door rendering

```
Implement door interaction (open/close) and 3D door rendering with animation.

1. Edit `src/types.ts`:
   - Add to `GameState`:
     ```typescript
     doorStates: Record<string, boolean>; // key: "x,y", value: true=open
     ```
   - Add actions:
     ```typescript
     toggleDoor: (x: number, y: number) => void;
     ```

2. Edit `src/store.ts`:
   - Initialize `doorStates: {}`
   - Implement `toggleDoor`: toggle the state at key `"${x},${y}"`, log "Door [opens/closes]"

3. Update `src/map/mapUtils.ts`:
   - Update `isOpaque`: add `TILE_DOOR` (value 2 — the original door constant) as opaque
   - Update `isSolid`: doors are not solid (you can walk through open doors)
   - Add `isDoor(tile: number): boolean` — returns true for TILE_DOOR or TILE_DOOR_CLOSED
   - The door state (open vs closed) will be handled externally, so mapUtils only checks tile type

4. Update `src/systems/movement.ts`:
   - When the player presses Space/Enter (check for `'Space'` or `'Enter'` key):
     - Check the tile directly in front of the player (based on facing)
     - If it's a door tile (use `isDoor` from mapUtils), call `toggleDoor`
     - Also check adjacent doors if no door directly in front

5. Update `src/components/DungeonView.tsx`:
   - Read `doorStates` from the store
   - For `TILE_DOOR` and `TILE_DOOR_CLOSED` tiles:
     - If the door is not open (check doorStates), render a door mesh:
       - A thin box (`boxGeometry` size `[1, WALL_HEIGHT, 0.1]` at the tile center, slightly offset toward the side the door opens from)
       - Color: brown `#8B4513` or `#654321`
       - Position: at tile center (x + 0.5, WALL_HEIGHT / 2, y + 0.5)
     - Since doors are placed between rooms, the rendering approach is similar to walls but with a different color and material
   - When the door is open, don't render the door geometry (or render it as a thin sliver along the wall)

   Note: To keep things simple, treat doors as wall-like objects that disappear when opened. Position them the same as the wall segments — they should replace the wall segment between two floor tiles.

6. Verify with `npm run build`.
```

##### Prompt 2 — Secret doors

```
Add secret door mechanic: hidden doors that reveal when walking adjacent.

1. Update `src/map/sampleDungeon.ts`:
   - Add a `TILE_SECRET_DOOR = 7` constant to `src/types.ts`:
     ```typescript
     export const TILE_SECRET_DOOR = 7;
     ```
   - Place a secret door in the dungeon (e.g. at x=9, y=5 — the wall between the south room and the corridor):
     Change row 5 from `[W,W,W,W,W,W,W,W,P,W,W,W]` to `[W,W,W,W,W,W,W,SD,P,W,W,W]` using the new constant

   - The secret door should be walkable and opaque when hidden, walkable and not opaque when revealed

2. Add to `GameState` in `src/types.ts`:
   ```typescript
   secretDoorsRevealed: Record<string, boolean>;
   ```
   - Add action:
     ```typescript
     revealSecretDoor: (x: number, y: number) => void;
     ```

3. Edit `src/store.ts`:
   - Initialize `secretDoorsRevealed: {}`
   - Implement `revealSecretDoor`: set `secretDoorsRevealed["${x},${y}"] = true`, log "You found a secret door!"

4. Create `src/systems/secretDoorDetect.ts`:
   - Export `useSecretDoorDetect()` hook
   - Subscribe to `playerPosition`
   - Check all 4 adjacent tiles for secret doors
   - If a secret door is found (tile type is TILE_SECRET_DOOR and not already revealed), call `revealSecretDoor`

5. Update `src/App.tsx`:
   - Import and call `useSecretDoorDetect()`

6. Update `src/components/DungeonView.tsx`:
   - For TILE_SECRET_DOOR tiles:
     - If not revealed: render as a normal wall (same as TILE_WALL)
     - If revealed: don't render (walkable passage)

7. Verify with `npm run build`.
```

### M11 — Fog of War & Lighting
- Limited visibility radius (~5 tiles from party position)
- Three tile states: **unexplored** (not rendered), **explored** (rendered dark), **visible** (fully lit)
- Track per-tile explored state in the game store
- Dim rendering: explored tiles use darker materials; visible tiles render normally
- Optional: torchlight falloff shader or point light on the camera

#### M11 Prompts

##### Prompt 1 — Fog of war system

```
Add fog of war: track explored tiles and dim the rendering of non-visible areas.

1. Edit `src/types.ts`:
   - Add to `GameState`:
     ```typescript
     exploredTiles: Set<string>; // keys "x,y"
     ```
   - Add action:
     ```typescript
     exploreTile: (x: number, y: number) => void;
     exploreRadius: (centerX: number, centerY: number, radius: number) => void;
     ```
   - Note: Zustand handles Sets — if needed, use a `Record<string, boolean>` instead for serialization:
     ```typescript
     exploredTiles: Record<string, boolean>;
     ```
     (Using Record is easier for state management)

2. Edit `src/store.ts`:
   - Initialize `exploredTiles: {}`
   - Implement `exploreTile`: set `exploredTiles["${x},${y}"] = true`
   - Implement `exploreRadius(centerX, centerY, radius)`:
     - Loop through all tiles within `radius` Manhattan distance of `(centerX, centerY)`
     - Use `getTile` to check bounds
     - Use raycasting logic: check if line from center to target tile is not blocked by opaque tiles (simple DDA or just check if a straight line passes only through non-opaque tiles)
     - For simplicity: use a straightforward approach — tiles within Manhattan distance `radius` that have a direct line-of-sight not blocked by opaque tiles
     - Mark each visible tile as explored

3. Create `src/systems/fogOfWar.ts`:
   - Export `useFogOfWar()` hook
   - Subscribe to `playerPosition` from the store
   - On position change, call `exploreRadius` with the current position and a radius of 5
   - Use line-of-sight checking: for each tile in the radius, cast a ray from center to tile center and check if any intermediate tile is opaque

4. Update `src/components/DungeonView.tsx`:
   - Import `useGameStore` from `../store`
   - Read `exploredTiles` from the store
   - Modify floor/ceiling rendering:
     - If tile `"${x},${y}"` is NOT in `exploredTiles`: don't render (skip)
     - If tile IS explored but player is not currently standing on a tile with LOS (simplify: just check distance > 3): use darker material colors (floor: `#333`, ceiling: `#111`)
     - If tile is visible (distance <= 3 or within LOS): use normal colors (`#555` floor, `#222` ceiling)

5. Update `src/App.tsx`:
   - Import and call `useFogOfWar()`

6. Verify with `npm run build`.
```

### M12 — Save/Load & Polish
- Serialize full game state (party, inventory, map state, fog grid) to JSON
- Persist to `localStorage` with save-slot UI
- Main menu: New Game, Continue, About
- Old-school UI theme: stone/parchment colors, serif fonts, bordered panels
- CSS transitions, hover effects, loading spinners

#### M12 Prompts

##### Prompt 1 — Save/load system

```
Implement save and load functionality using localStorage.

1. Create `src/systems/saveLoad.ts`:
   - Import `useGameStore` from `../store`
   - Export `saveGame(slot: number): boolean`:
     - Get the full state via `useGameStore.getState()`
     - Serialize to JSON string
     - Save to `localStorage` key `dungeon_save_${slot}`
     - Add a log message "Game saved to slot [slot]"
     - Return true on success, false on failure
   - Export `loadGame(slot: number): boolean`:
     - Read from `localStorage` key `dungeon_save_${slot}`
     - If not found, return false
     - Parse JSON and call `useGameStore.setState(parsedState)`
     - Add a log message "Game loaded from slot [slot]"
     - Return true on success, false on failure
   - Export `getSaveSlots(): { slot: number; timestamp: string }[]`:
     - Iterate localStorage keys matching `dungeon_save_*`
     - Extract slot number and timestamp from each save
     - Return sorted array

2. Add keyboard shortcut — update `src/systems/movement.ts`:
   - Add save/load key handling: F5 = save to slot 0, F9 = load from slot 0
   - Import `saveGame`, `loadGame` from `../systems/saveLoad`

3. Verify with `npm run build`.
```

##### Prompt 2 — Main menu and UI polish

```
Create a main menu and polish the UI with an old-school theme.

1. Create `src/components/MainMenu.tsx`:
   - Local state: `'menu' | 'playing'` screen
   - Menu screen shows:
     - Game title: "Dungeon of the Catacombs" in large serif font, color #c84 (gold)
     - Subtitle: "A First-Person Dungeon Crawl"
     - Buttons: [New Game] [Continue] [About]
     - New Game: sets screen to 'playing'
     - Continue: loads from slot 0, then sets 'playing'
     - About: shows a text overlay with credits, click to dismiss
   - Styled with centered layout, stone-textured background

2. Update `src/App.tsx`:
   - Import `MainMenu` from `./components/MainMenu`
   - Add a `gameStarted` state (initially false)
   - If not started, render `<MainMenu onStart={() => setGameStarted(true)} />` instead of the game layout
   - When started, render the normal 3-pane layout

3. Polish `src/App.css`:
   - Update the global theme:
     - Font: serif family (`'Palatino', 'Georgia', serif`)
     - Background colors: dark stone tones
     - Borders: thicker, with a beveled/inset look using border colors
     - Scrollbar styling for webkit browsers
   - Add CSS for the main menu:
     ```css
     .main-menu {
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       height: 100vh;
       background: #111;
       color: #ccc;
       font-family: 'Palatino', 'Georgia', serif;
     }
     .main-menu h1 { font-size: 48px; color: #c84; margin-bottom: 8px; text-shadow: 2px 2px 4px #000; }
     .main-menu h2 { font-size: 18px; color: #888; margin-bottom: 40px; font-weight: normal; }
     .main-menu button {
       display: block;
       width: 240px;
       padding: 12px;
       margin: 8px;
       font-size: 18px;
       font-family: inherit;
       background: #2a2a2a;
       color: #ccc;
       border: 2px solid #555;
       border-radius: 4px;
       cursor: pointer;
     }
     .main-menu button:hover { background: #3a3a3a; border-color: #888; }
     ```

4. Verify with `npm run build`.
```

---

## Getting Started

```bash
npm create vite@latest . -- --template react-ts
npm install @react-three/fiber @react-three/drei three zustand
```
