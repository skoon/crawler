function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

function rollDice(notation: string): number {
  const [count, sides] = notation.split('d').map(Number)
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }
  return total
}

const BASE_THAC0 = 19

function getStrDamageBonus(str: number): number {
  if (str >= 18) return 2
  if (str >= 15) return 1
  if (str >= 12) return 0
  return -1
}

export function resolvePlayerAttack(
  attackerStr: number,
  targetAc: number,
  weaponDamageDice?: string,
  weaponDamageBonus?: number,
): { hit: boolean; damage: number } {
  const roll = rollD20()
  const thac0 = BASE_THAC0
  const hit = roll >= thac0 - targetAc
  const dice = weaponDamageDice || '1d4' // Fists if no weapon
  const bonus = (weaponDamageBonus ?? 0) + getStrDamageBonus(attackerStr)
  const damage = hit ? Math.max(1, rollDice(dice) + bonus) : 0
  return { hit, damage }
}

export function resolveEnemyAttack(
  enemyThac0: number,
  enemyDamage: string,
  enemyDamageBonus: number,
  targetAc: number,
): { hit: boolean; damage: number } {
  const roll = rollD20()
  const hit = roll >= enemyThac0 - targetAc
  const damage = hit ? Math.max(1, rollDice(enemyDamage) + enemyDamageBonus) : 0
  return { hit, damage }
}
