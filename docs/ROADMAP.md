# Forward Roadmap

A forward-looking view of where the dungeon crawler is headed. This complements two
sibling documents:

- [`PLAN.md`](./PLAN.md) — the detailed, per-milestone build plan (M1–M25) with prompts.
- [`milestone_status.md`](./milestone_status.md) — the live checklist of what's done.

This document stays high-altitude: *direction and sequencing*, not step-by-step prompts.

---

## Where we are

- **Phases 1–3 (M1–M20): complete.** Core foundation, real dungeons, and advanced
  systems are all in: 3D rendering, grid movement, combat, magic/MP, status effects,
  traps & puzzles, multi-level architecture, JSON levels, the in-browser map builder,
  automap, NPCs/dialogue/shops, and ZIP dungeon modules.
- **Current milestone: M21 — Lighting, Torches & Resting.** Torch timer drives the
  fog-of-war radius; rest to recover HP with random-encounter risk.

---

## Near-term (finish Phase 3)

### M20 — Dungeon Modules
- JSZip-based packaging: multiple JSON levels + custom textures + manifest in one `.zip`.
- Import handler to load entire standalone campaigns at once.
- **Why now:** it turns the existing map builder (M15) and JSON format (M14) into
  shareable content, which is the foundation everything in "Beyond" builds on.

---

## Phase 4 — Atmosphere & Polish (M21–M25)

These are specified in detail in `PLAN.md`; summarized here for sequencing.

| Milestone | Theme | Headline outcome |
|---|---|---|
| **M21** | Lighting, Torches & Resting | Torch timer drives fog-of-war radius; rest to recover with encounter risk |
| **M22** | Ranged Combat & Targeting | Bows/thrown weapons, targeting reticle, LOS + ammo tracking |
| **M23** | Sound, Music & Atmosphere | Ambient audio, footsteps, combat SFX, positional 3D sound, music |
| **M24** | Character Creation & Party Management | New-game roll/choose/name flow, party templates |
| **M25** | Death, Progression & Game Over | Death saves, TPK game-over, XP/leveling, resurrection & training |

**Suggested ordering rationale:** M24 (character creation) and M25 (progression) close
the loop on a *full playthrough*, so they're the natural cap of Phase 4. M21–M23 deepen
the moment-to-moment feel and can be reordered freely based on appetite.

---

## Beyond M25 — Candidate directions

Not yet committed. Grouped by intent so they can be promoted into milestones when chosen.

### Content & authoring
- **Campaign system:** chain modules into a multi-dungeon campaign with persistent party
  carryover (build on M20 ZIP modules).
- **Map builder upgrades:** undo/redo, copy/paste regions, trigger-link visualization,
  in-editor playtest, and a validation pass (unreachable tiles, orphaned triggers).
- **Sharable module gallery:** import/export to a URL or file drop, with a manifest
  preview before load.

### Gameplay depth
- **More enemy behaviors:** ranged/casting enemies, fleeing, group tactics, status-based
  AI (already have BFS pursuit from M8).
- **Richer items:** charges/identification, cursed items, stackables, item sets.
- **Spell expansion:** area-of-effect targeting on the grid, durations/concentration,
  utility spells (knock, light, detect) wired to dungeon interaction.

### Presentation
- **Asset pipeline:** replace placeholder colored geometry with the Kenney retro textures
  already vendored under `src/assets/textures/`, plus wall/floor/door variants per level.
- **Animated enemies & doors:** sprite-sheet billboards; hinge/slide door animation.
- **Accessibility & input:** remappable keys, full touch/mobile controls, colorblind-safe
  UI, reduced-motion mode.

### Platform & quality
- **Automated tests:** unit-test the `src/systems/*` modules (pure rules logic is the
  high-value target) and add a smoke test for load → move → fight → save.
- **Performance:** instanced wall/floor meshes for large levels; lazy-load module assets.
- **Save system hardening:** versioned save schema + migration, multiple named slots,
  export/import saves.

---

## How to use this doc

When picking up new work:
1. Confirm current status in `milestone_status.md`.
2. If it's an existing milestone (≤ M25), follow the detailed prompts in `PLAN.md`.
3. If it's a "Beyond" item, promote it to a numbered milestone first — add it to `PLAN.md`
   (with the same milestone + prompt structure) and to `milestone_status.md` — then build.
