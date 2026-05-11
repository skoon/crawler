import { useGameStore } from '../store'
import type { EquipSlot, Item } from '../types'

const EQUIP_SLOTS: { slot: EquipSlot; label: string; accepts: string[] }[] = [
  { slot: 'weapon', label: 'Weapon', accepts: ['weapon'] },
  { slot: 'armor', label: 'Armor', accepts: ['armor'] },
  { slot: 'shield', label: 'Shield', accepts: ['shield'] },
  { slot: 'ring1', label: 'Ring 1', accepts: ['ring'] },
  { slot: 'ring2', label: 'Ring 2', accepts: ['ring'] },
]

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    weapon: '⚔',
    armor: '🛡',
    shield: '🔰',
    ring: '💍',
    potion: '🧪',
    scroll: '📜',
    key: '🔑',
    misc: '📦',
  }
  return icons[type] ?? '?'
}

/** Determine which equip slot (if any) an item can go into */
function slotForItem(item: Item): EquipSlot | null {
  const map: Record<string, EquipSlot> = {
    weapon: 'weapon',
    armor: 'armor',
    shield: 'shield',
  }
  return map[item.type] ?? (item.type === 'ring' ? 'ring1' : null)
}

export function InventoryPane() {
  const inventory = useGameStore((s) => s.inventory)
  const party = useGameStore((s) => s.party)
  const selectedIndex = useGameStore((s) => s.selectedMemberIndex)
  const equipItem = useGameStore((s) => s.equipItem)
  const unequipItem = useGameStore((s) => s.unequipItem)
  const useItem = useGameStore((s) => s.useItem)

  const member = party[selectedIndex]
  const equipment = member?.equipment ?? {}
  const totalWeight = inventory.reduce((sum, item) => sum + item.weight, 0)

  const handleEquip = (item: Item) => {
    let slot = slotForItem(item)
    if (!slot) return
    // If ring1 is occupied, try ring2
    if (slot === 'ring1' && equipment.ring1 && !equipment.ring2) {
      slot = 'ring2'
    }
    equipItem(selectedIndex, slot, item)
  }

  const handleUnequip = (slot: EquipSlot) => {
    unequipItem(selectedIndex, slot)
  }

  const handleUse = (item: Item) => {
    useItem(item.id, selectedIndex)
  }

  return (
    <div className="inventory-pane">
      <div className="inv-section-title">
        Equipped — {member?.name ?? 'None'}
      </div>
      <div className="inv-slots">
        {EQUIP_SLOTS.map(({ slot, label }) => {
          const equipped = equipment[slot]
          return (
            <div
              key={slot}
              className={`inv-slot${equipped ? ' inv-slot-filled' : ''}`}
              onClick={() => equipped && handleUnequip(slot)}
              title={equipped ? `Click to unequip ${equipped.name}` : `${label} — empty`}
            >
              <span className="inv-slot-label">{label}</span>
              {equipped ? (
                <span className="inv-slot-item">{equipped.name}</span>
              ) : (
                <span className="inv-slot-empty">[empty]</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="inv-section-title">Backpack</div>
      <div className="inv-grid">
        {inventory.length === 0 ? (
          <div className="inv-empty">(no items)</div>
        ) : (
          inventory.map((item) => {
            const canEquip = slotForItem(item) !== null
            const canUse = item.consumable
            return (
              <div key={item.id} className="inv-item" title={item.description}>
                <span className="inv-item-icon">{typeIcon(item.type)}</span>
                <span className="inv-item-name">{item.name}</span>
                <span className="inv-item-actions">
                  {canEquip && (
                    <button
                      className="inv-btn"
                      onClick={() => handleEquip(item)}
                      title={`Equip ${item.name}`}
                    >
                      Equip
                    </button>
                  )}
                  {canUse && (
                    <button
                      className="inv-btn inv-btn-use"
                      onClick={() => handleUse(item)}
                      title={`Use ${item.name}`}
                    >
                      Use
                    </button>
                  )}
                </span>
              </div>
            )
          })
        )}
      </div>
      <div className="inv-weight">Total weight: {totalWeight.toFixed(1)} / 50 lbs</div>
    </div>
  )
}
