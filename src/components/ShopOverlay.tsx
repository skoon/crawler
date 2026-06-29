import { useGameStore } from '../store'
import { itemTemplates } from '../data/items'

const ITEM_PRICES: Record<string, number> = {
  'healing-potion': 15,
  'mana-potion': 20,
  'short-sword': 35,
  'leather-armor': 50,
  'shield': 25,
}

export function ShopOverlay() {
  const activeNpcId = useGameStore((s) => s.activeNpcId)
  const showShop = useGameStore((s) => s.showShop)
  const npcs = useGameStore((s) => s.npcs)
  const gold = useGameStore((s) => s.gold)
  const inventory = useGameStore((s) => s.inventory)
  const buyItem = useGameStore((s) => s.buyItem)
  const sellItem = useGameStore((s) => s.sellItem)
  const endDialogue = useGameStore((s) => s.endDialogue)

  if (!activeNpcId || !showShop) return null

  const merchant = npcs.find((n) => n.id === activeNpcId)
  if (!merchant) return null

  const shopItems = merchant.shopItems ?? []

  // Group merchant wares to display quantity count
  const waresCount: Record<string, number> = {}
  for (const itemId of shopItems) {
    waresCount[itemId] = (waresCount[itemId] || 0) + 1
  }

  const getSellPrice = (itemBaseId: string) => {
    const buyPrice = ITEM_PRICES[itemBaseId] || 10
    return Math.floor(buyPrice * 0.5)
  }

  const handleBackToTalk = () => {
    useGameStore.setState({ showShop: false })
  }

  return (
    <div className="dialogue-overlay">
      <div className="shop-box">
        <div className="dialogue-header">Shop — {merchant.name}</div>
        <div className="shop-gold-hud">Your Gold: <span className="gold-value">{gold} GP</span></div>
        
        <div className="shop-panels">
          {/* Left panel: Merchant Wares */}
          <div className="shop-panel">
            <h3 className="shop-panel-title">Merchant's Wares</h3>
            <div className="shop-items-list">
              {Object.keys(waresCount).length === 0 ? (
                <div className="shop-empty-msg">Sold out!</div>
              ) : (
                Object.entries(waresCount).map(([itemId, qty]) => {
                  const item = itemTemplates[itemId]
                  const price = ITEM_PRICES[itemId] || 10
                  if (!item) return null

                  return (
                    <div key={itemId} className="shop-item-card">
                      <div className="shop-item-info">
                        <div className="shop-item-name">{item.name} <span className="shop-item-qty">x{qty}</span></div>
                        <div className="shop-item-desc">{item.description}</div>
                      </div>
                      <div className="shop-item-actions">
                        <span className="shop-item-price">{price} GP</span>
                        <button
                          className="shop-buy-btn"
                          disabled={gold < price}
                          onClick={() => buyItem(itemId, price)}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right panel: Player Backpack */}
          <div className="shop-panel">
            <h3 className="shop-panel-title">Your Inventory</h3>
            <div className="shop-items-list">
              {inventory.length === 0 ? (
                <div className="shop-empty-msg">Backpack is empty</div>
              ) : (
                inventory.map((item) => {
                  const baseId = item.id.includes('_instance_')
                    ? item.id.split('_instance_')[0]
                    : item.id
                  const sellPrice = getSellPrice(baseId)

                  return (
                    <div key={item.id} className="shop-item-card">
                      <div className="shop-item-info">
                        <div className="shop-item-name">{item.name}</div>
                        <div className="shop-item-desc">{item.description}</div>
                      </div>
                      <div className="shop-item-actions">
                        <span className="shop-item-price">{sellPrice} GP</span>
                        <button
                          className="shop-sell-btn"
                          onClick={() => sellItem(item.id, sellPrice)}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="shop-actions">
          <button className="dialogue-choice-btn dialogue-exit" onClick={handleBackToTalk}>
            Back to Talk
          </button>
          <button className="dialogue-choice-btn dialogue-exit" onClick={endDialogue}>
            Leave Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
