# Dungeon of the Catacombs — Player's Handbook

> *A tabletop-style reference for the first-person dungeon crawler.*

---

## 1. Character Creation

Each player controls a party of **four adventurers**. A character is defined by their **class**, **attributes**, and **equipment**.

### 1.1 Attributes

Six core attributes define a character's raw capabilities, rolled on **3d6**.

| Attribute | Abbrev. | Description |
|---|---|---|
| Strength | STR | Melee damage bonus, carrying capacity |
| Dexterity | DEX | Ranged accuracy, AC bonus (Thief) |
| Constitution | CON | Hit Point modifier |
| Intelligence | INT | Spellcasting power (Mage) |
| Wisdom | WIS | Spellcasting power (Cleric) |
| Charisma | CHA | NPC reactions, shop prices |

**Score Ranges:**

| Score | Modifier |
|---|---|
| 3 | −3 |
| 4–5 | −2 |
| 6–8 | −1 |
| 9–12 | +0 |
| 13–15 | +1 |
| 16–17 | +2 |
| 18 | +3 |

### 1.2 Derived Statistics

| Stat | Formula |
|---|---|
| **Hit Points (HP)** | Class hit die + CON modifier |
| **Max HP** | As HP; increased on level-up |
| **Mana Points (MP)** | Class base (see table) |
| **Max MP** | As MP; increases on level-up |
| **Armor Class (AC)** | Class base + DEX modifier + equipment bonus |
| **To-Hit (THAC0)** | Base 19 (all classes); lower is better |

### 1.3 Classes

#### Fighter

> *Masters of arms, standing firm in the front line.*

| Stat | Value |
|---|---|
| Hit Die | 1d10 |
| Base HP | 12 |
| Base MP | 0 |
| Base AC | 18 (plate + shield baseline) |
| Prime Attribute | STR |
| Allowed Weapons | All |
| Allowed Armor | All |

**Special:** +1 damage per 4 levels.

#### Mage

> *Wielders of arcane power, devastating at range but frail in melee.*

| Stat | Value |
|---|---|
| Hit Die | 1d4 |
| Base HP | 6 |
| Base MP | 20 |
| Base AC | 10 (unarmored) |
| Prime Attribute | INT |
| Allowed Weapons | Dagger, staff |
| Allowed Armor | None |

**Spells:** Magic Missile, Fireball, Sleep, Haste, Shield.

#### Cleric

> *Divine servants who heal the wounded and smite the undead.*

| Stat | Value |
|---|---|
| Hit Die | 1d8 |
| Base HP | 10 |
| Base MP | 15 |
| Base AC | 16 (chain + shield) |
| Prime Attribute | WIS |
| Allowed Weapons | Mace, staff |
| Allowed Armor | All (no edged weapons) |

**Spells:** Heal, Shield.

#### Thief

> *Quick and cunning, excelling at stealth and finding traps.*

| Stat | Value |
|---|---|
| Hit Die | 1d6 |
| Base HP | 8 |
| Base MP | 0 |
| Base AC | 14 (leather + DEX) |
| Prime Attribute | DEX |
| Allowed Weapons | Dagger, short sword, bow |
| Allowed Armor | Leather only |

**Special:** +2 to-hit with ranged weapons.

### 1.4 The Pre-Made Party

| Name | Class | Role |
|---|---|---|
| **Aldric** | Fighter | Front-line damage dealer and shield |
| **Elara** | Mage | Ranged arcane damage and control |
| **Brother Malek** | Cleric | Healing and divine support |
| **Shadow** | Thief | Ranged attacks and utility |

---

## 2. Leveling & Progression

### 2.1 Experience Points (XP)

XP is awarded for defeating enemies. Each slain enemy grants the listed XP value, distributed to all living party members equally.

### 2.2 Level Thresholds

| Level | XP Required |
|---|---|
| 1 | 0 |
| 2 | 2,000 |
| 3 | 4,000 |
| 4 | 8,000 |
| 5 | 16,000 |
| 6 | 32,000 |
| +1 | ×2 previous |

### 2.3 Level-Up Benefits

When a character gains a level:

1. **Hit Points:** Roll the class hit die + CON modifier (minimum 1).
2. **Mana Points:** Gain +1d4 MP (Mage), +1d3 MP (Cleric), +0 (Fighter/Thief).
3. **THAC0:** Improves by 1 every 3 levels.
4. **Spells:** Mages learn new spells at levels 3 and 5.

---

## 3. Combat System

Combat is **turn-based** and proceeds in rounds.

### 3.1 Turn Order

1. **Player Phase** — The active party member may take one action.
2. **Enemy Phase** — All alive enemies act simultaneously.
3. Repeat until one side is defeated.

### 3.2 Actions

#### Attack

A melee or ranged strike against a target enemy.

1. **Select a target** by clicking on an enemy.
2. Click **Attack**.
3. The game rolls a **d20**:
   - If `d20 ≥ (THAC0 − target AC)` → **Hit**
   - Otherwise → **Miss**

**Damage on hit:**
```
weapon damage dice + STR modifier (melee)
weapon damage dice + DEX modifier (ranged)
```

**Unarmed:** 1d4 damage (no weapon equipped).

#### Defend

The character takes a defensive stance. Until the character's next turn, all incoming damage is halved (rounded down). No attack is made.

#### Use Item

Consume a potion or scroll from the inventory. Healing potions restore **2d4 HP**. Mana potions restore **10 MP**.

#### Cast Spell

See **Section 4 — Magic System**.

### 3.3 To-Hit Example

Aldric (Fighter, STR 16, THAC0 19) attacks a Goblin (AC 13):
- THAC0 19 − AC 13 = need **6 or higher** on d20
- Roll: 12 → **Hit!**
- Damage: 1d8 (longsword) + 1 (STR 16) = 7

### 3.4 Damage & Death

- HP reduced to 0 → character is **Unconscious**
- Unconscious characters cannot act
- If all party members are unconscious → **Total Party Kill (TPK)**
- Healing an unconscious character restores them to action

### 3.5 Status Effects

| Effect | Duration | Effect |
|---|---|---|
| **Poison** | 1d4 rounds | 1d4 damage per round |
| **Burn** | 1d3 rounds | 1d6 damage per round |
| **Sleep** | 1d3 rounds | Cannot act |
| **Paralysis** | 1d3 rounds | Cannot act |
| **Haste** | 3 rounds | Double attacks per turn |
| **Shield** | 3 rounds | +4 AC bonus |

Status effects tick down at the **end of each round**. Damage-over-time effects apply immediately on tick. Expired effects are removed.

---

## 4. Magic System

Magic runs on **Mana Points (MP)**. A spell can only be cast if the caster has sufficient MP.

### 4.1 MP Basics

- **MP pool** is per-character, shared across all spells
- MP is restored by **Mana Potions** (10 MP) or by leveling up
- A character with insufficient MP cannot cast

### 4.2 Spell List

#### Magic Missile
| | |
|---|---|
| **Class** | Mage |
| **Cost** | 5 MP |
| **Target** | Single enemy |
| **Effect** | Auto-hit. Deals 1d4+1 force damage. |
| **Description** | "A bolt of pure arcane energy unerringly strikes your foe." |

#### Fireball
| | |
|---|---|
| **Class** | Mage |
| **Cost** | 12 MP |
| **Target** | All enemies |
| **Effect** | Deals 2d6 fire damage to every enemy in the room. |
| **Description** | "A roaring sphere of flame erupts in the midst of your enemies." |

#### Heal
| | |
|---|---|
| **Class** | Cleric |
| **Cost** | 8 MP |
| **Target** | Single ally |
| **Effect** | Restores 2d6+2 HP. Cannot exceed the target's maximum HP. |
| **Description** | "Warm divine light knits wounds and mends bones." |

#### Sleep
| | |
|---|---|
| **Class** | Mage |
| **Cost** | 6 MP |
| **Target** | Single enemy |
| **Effect** | Target falls asleep for 1d3 rounds. Sleeping enemies cannot act. |
| **Description** | "Magical lethargy overwhelms your opponent's mind." |

#### Haste
| | |
|---|---|
| **Class** | Mage |
| **Cost** | 10 MP |
| **Target** | Single ally |
| **Effect** | Target gains double attacks per turn for 3 rounds. |
| **Description** | "Time bends to your will, accelerating your ally's movements." |

#### Shield
| | |
|---|---|
| **Class** | Mage, Cleric |
| **Cost** | 4 MP |
| **Target** | Single ally |
| **Effect** | Target gains +4 AC for 3 rounds. |
| **Description** | "A shimmering barrier of magical force surrounds your ally." |

### 4.3 Spellcasting Rules

1. Declare the spell and target.
2. Pay the MP cost (MP is deducted immediately).
3. Resolve the spell effect.
4. Caster cannot take further actions that round.

### 4.4 Spell Targeting

| Target Type | Meaning |
|---|---|
| **Single enemy** | Click on the enemy to select, then cast |
| **All enemies** | No target selection needed — affects every alive enemy |
| **Single ally** | Select from the party member list |
| **Self** | Automatically targets the caster |

---

## 5. Equipment & Items

### 5.1 Equipment Slots

Each character has five equipment slots:

| Slot | Effect |
|---|---|
| **Weapon** | Determines damage dice and damage bonus |
| **Armor** | Determines AC bonus |
| **Shield** | Additional AC bonus |
| **Ring 1** | Magical effects |
| **Ring 2** | Magical effects |

### 5.2 Item Types

| Type | Examples | Consumable? |
|---|---|---|
| Weapon | Short Sword, Long Sword | No |
| Armor | Leather Armor, Chain Mail | No |
| Shield | Iron Shield, Wooden Shield | No |
| Potion | Healing Potion, Mana Potion | Yes |
| Ring | Ring of Protection | No |
| Scroll | Scroll of Fireball | Yes |
| Key | Rusty Key | No |

### 5.3 Using Consumables

Consumable items can be used in or out of combat via the **Use Item** action. Using a consumable removes it from the inventory.

---

## 6. Dungeon Hazards

### 6.1 Traps

| Type | Trigger | Effect |
|---|---|---|
| Spike Trap | Step on tile | 1d4 piercing damage |
| Poison Dart | Step on tile | 1d6 poison damage |
| Pit | Step on tile | Dropped to lower level (if stairs present) or damage |

### 6.2 Teleporters

Stepping on a teleporter tile instantly transports the party to a linked destination tile elsewhere in the dungeon. Teleporters can be used repeatedly.

### 6.3 Switches

Press **Space/Enter** while facing a switch tile to activate it. Switches can:
- **Toggle a door** (open ↔ closed)
- **Reveal a secret door**

---

## 7. Rest & Recovery

- **HP** and **MP** are restored by consuming potions.
- **Saving the game** preserves all current HP, MP, and inventory states.
- Unconscious characters are revived when healed above 0 HP.
