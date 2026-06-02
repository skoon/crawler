# Dungeon Crawler — Eye of the Beholder-style

## Overview

A first-person tile-based dungeon crawler built with React, Three.js, and TypeScript. Classic grid-based RPG gameplay inspired by Eye of the Beholder.

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| Language | TypeScript |
| UI | React 19 |
| 3D Rendering | Three.js via `@react-three/fiber` + `@react-three/drei` |
| State Management | Zustand |
| Layout | CSS Grid (3-pane) |

## Features

### Phase 1 — Core Foundation (Complete)
- 3-pane UI layout: Party \| 3D Dungeon View \| Stats/Inventory/Log
- Tile-based grid movement with smooth camera lerp
- Wall collision detection and movement boundaries
- Textured 3D dungeon rendering (walls, floors, ceilings)
- Door interaction (open/close with Space/Enter)
- Secret doors (auto-reveal when walking adjacent)
- Turn-based combat system with Attack/Defend/Use Item
- Enemy AI with BFS pathfinding
- Inventory system (pickup, equip, unequip, use consumables)
- Fog of war with line-of-sight and exploration tracking
- Save/load system (5 slots + F5 quicksave / F9 quickload)
- Main menu with New Game / Load / Level Editor / About
- In-game pause menu (Escape)

### Phase 2 — Dungeon Building (Complete)
- Multi-level dungeon architecture with stairs transitions
- JSON dungeon format with loader utility
- In-browser map editor for creating custom levels

### Phase 3 — Gameplay & Advanced Systems (In Progress)
- M16: Advanced Combat & Magic System — MP, spells, status effects

## Controls

| Key | Action |
|---|---|
| W / Arrow Up | Move forward |
| S / Arrow Down | Move backward |
| A / Arrow Left | Turn left |
| D / Arrow Right | Turn right |
| Shift + A / Left | Strafe left |
| Shift + D / Right | Strafe right |
| Space / Enter | Interact (doors) |
| Escape | Pause / In-game menu |
| F5 | Quicksave |
| F9 | Quickload |

## Getting Started

```bash
npm install
npm run dev
```

## Project Status

Active development. See [docs/PLAN.md](PLAN.md) for the full roadmap and [docs/milestone_status.md](milestone_status.md) for current progress.
