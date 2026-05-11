import { useGameStore } from '../store'

const SLOT_NAMES = ['Weapon', 'Armor', 'Shield', 'Ring 1', 'Ring 2'] as const

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    weapon: '[W]',
    armor: '[A]',
    shield: '[S]',
    ring: '[R]',
    potion: '[P]',
    scroll: '[Sc]',
    key: '[K]',
    misc: '[M]',
  }
  return icons[type] ?? '[?]'
}

export function InventoryPane() {
  const inventory = useGameStore((s) => s.inventory)

  const totalWeight = inventory.reduce((sum, item) => sum + item.weight, 0)

  return (
    <div className="inventory-pane">
      <div className="inv-section-title">Equipped</div>
      <div className="inv-slots">
        {SLOT_NAMES.map((name) => (
          <div key={name} className="inv-slot">
            <span className="inv-slot-label">{name}</span>
            <span className="inv-slot-empty">[empty]</span>
          </div>
        ))}
      </div>
      <div className="inv-section-title">Backpack</div>
      <div className="inv-grid">
        {inventory.length === 0 ? (
          <div className="inv-empty">(no items)</div>
        ) : (
          inventory.map((item) => (
            <div key={item.id} className="inv-item" title={item.description}>
              <span className="inv-item-icon">{typeIcon(item.type)}</span>
              <span className="inv-item-name">{item.name}</span>
              <span className="inv-item-weight">{item.weight} lbs</span>
            </div>
          ))
        )}
      </div>
      <div className="inv-weight">Total weight: {totalWeight} / 50 lbs</div>
    </div>
  )
}
