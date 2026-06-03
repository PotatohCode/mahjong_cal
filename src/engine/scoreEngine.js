/**
 * Singapore Mahjong Score Engine
 * Rules: https://www.singaporemahjong.com/rules/
 */

export const WIN_TYPE = {
  SELF_DRAW: 'self_draw',
  DISCARD: 'discard',
}

export const TAI_SOURCES = {
  // Tile-based
  DRAGON_PONG: { key: 'DRAGON_PONG', label: 'Dragon Pong/Kong', tai: 1, category: 'tile' },
  PREVAILING_WIND_PONG: { key: 'PREVAILING_WIND_PONG', label: 'Prevailing Wind Pong/Kong', tai: 1, category: 'tile' },
  PLAYER_WIND_PONG: { key: 'PLAYER_WIND_PONG', label: 'Player Wind Pong/Kong', tai: 1, category: 'tile' },
  ANIMAL_TILE: { key: 'ANIMAL_TILE', label: 'Animal Tile (per tile)', tai: 1, category: 'tile', repeatable: true },
  COMPLETE_ANIMAL_SET: { key: 'COMPLETE_ANIMAL_SET', label: 'Complete Animal Set (bonus)', tai: 1, category: 'tile' },
  WIND_FLOWER: { key: 'WIND_FLOWER', label: 'Matching Wind Flower (per tile)', tai: 1, category: 'tile', repeatable: true },
  COMPLETE_FLOWER_SET: { key: 'COMPLETE_FLOWER_SET', label: 'Complete Flower Set (bonus)', tai: 1, category: 'tile' },
  COMPLETE_SEASON_SET: { key: 'COMPLETE_SEASON_SET', label: 'Complete Season Set (bonus)', tai: 1, category: 'tile' },

  // Hand-based
  ALL_CHOW: { key: 'ALL_CHOW', label: 'All Chow', tai: 1, category: 'hand' },
  PING_WU: { key: 'PING_WU', label: 'Ping Wu (All Chow, no exposed flowers/animals)', tai: 4, category: 'hand' },
  ALL_PONG: { key: 'ALL_PONG', label: 'All Pong', tai: 2, category: 'hand' },
  HALF_COLOR: { key: 'HALF_COLOR', label: 'Half Color', tai: 2, category: 'hand' },
  FULL_COLOR: { key: 'FULL_COLOR', label: 'Full Color', tai: 4, category: 'hand' },
  ALL_TERMINAL: { key: 'ALL_TERMINAL', label: 'All Terminal', tai: 9, category: 'hand' },
  HALF_TERMINAL: { key: 'HALF_TERMINAL', label: 'Half Terminal', tai: 2, category: 'hand' },

  // Special hands
  THIRTEEN_WONDERS: { key: 'THIRTEEN_WONDERS', label: '13 Wonders', tai: 8, category: 'special' },
  SEVEN_FLOWERS: { key: 'SEVEN_FLOWERS', label: 'Seven Flower Tiles', tai: 10, category: 'special' },
  EIGHT_FLOWERS: { key: 'EIGHT_FLOWERS', label: 'Eight Flower Tiles', tai: 12, category: 'special' },
  ALL_DRAGONS: { key: 'ALL_DRAGONS', label: 'All Dragons', tai: 7, category: 'special' },
  ALL_WINDS: { key: 'ALL_WINDS', label: 'All Winds', tai: 12, category: 'special' },
  TWO_DRAGONS_EYE: { key: 'TWO_DRAGONS_EYE', label: 'Two Dragons + third as Eye', tai: 1, category: 'special' },
  THREE_DRAGONS_EYE: { key: 'THREE_DRAGONS_EYE', label: 'Three Dragons + third as Eye', tai: 4, category: 'special' },

  // Circumstance
  REPLACEMENT_TILE: { key: 'REPLACEMENT_TILE', label: 'Replacement Tile Win', tai: 1, category: 'circumstance' },
  LAST_TILE: { key: 'LAST_TILE', label: 'Last Valid Tile Win', tai: 1, category: 'circumstance' },
  ROBBING_KONG: { key: 'ROBBING_KONG', label: 'Robbing the Kong', tai: 1, category: 'circumstance' },
}

/**
 * Calculate total tai from a list of active tai source keys, capped at maxTai.
 *
 * @param {string[]} activeSources - Array of TAI_SOURCES keys
 * @param {Object} counts - Repeatable source counts e.g. { ANIMAL_TILE: 3 }
 * @param {number} maxTai - Maximum tai cap (default 5)
 * @returns {{ totalTai: number, breakdown: { key, label, tai }[], capped: boolean }}
 */
export function calculateTai(activeSources, counts = {}, maxTai = 5) {
  const breakdown = []

  for (const key of activeSources) {
    const source = TAI_SOURCES[key]
    if (!source) continue

    const count = source.repeatable ? (counts[key] ?? 1) : 1
    const tai = source.tai * count

    breakdown.push({ key, label: source.label, tai, count })
  }

  const rawTotal = breakdown.reduce((sum, b) => sum + b.tai, 0)
  const totalTai = Math.min(rawTotal, maxTai)

  return { totalTai, breakdown, capped: rawTotal > maxTai }
}

/**
 * Calculate point exchanges for a round.
 *
 * @param {number} totalTai
 * @param {string} winType - WIN_TYPE value
 * @param {string[]} playerIds - All player IDs
 * @param {string} winnerId
 * @param {string|null} discarderId - Required if winType === DISCARD
 * @param {boolean} payAll - One player pays all opponents (standard pay-all scenario)
 * @param {boolean} shooterPay - Discarder pays basePoints×4 to winner only; others pay nothing
 * @param {number} base - Starting point value. Each tai doubles it: basePoints = base × 2^(tai-1). Default 2.
 * @returns {{ basePoints: number, exchanges: { from: string, to: string, amount: number }[] }}
 */
export function calculatePoints(
  totalTai,
  winType,
  playerIds,
  winnerId,
  discarderId = null,
  payAll = false,
  shooterPay = false,
  base = 2
) {
  const basePoints = totalTai === 0 ? base : base * Math.pow(2, totalTai - 1)
  const losers = playerIds.filter(id => id !== winnerId)
  const exchanges = []

  if (shooterPay) {
    exchanges.push({ from: discarderId, to: winnerId, amount: basePoints * 4 })
    return { basePoints, exchanges }
  }

  if (payAll) {
    const payer = discarderId
    const recipients = playerIds.filter(id => id !== payer)
    for (const recipient of recipients) {
      exchanges.push({ from: payer, to: recipient, amount: basePoints * 2 })
    }
    return { basePoints, exchanges }
  }

  if (winType === WIN_TYPE.SELF_DRAW) {
    for (const loser of losers) {
      exchanges.push({ from: loser, to: winnerId, amount: basePoints * 2 })
    }
  } else {
    for (const loser of losers) {
      const amount = loser === discarderId ? basePoints * 2 : basePoints
      exchanges.push({ from: loser, to: winnerId, amount })
    }
  }

  return { basePoints, exchanges }
}

/**
 * Calculate flat bonus point transfers (Kongs, Animals, Flowers) outside the win scoring.
 *
 * @param {Object} bonuses
 * @param {number} bonuses.kongPoints - Points per kong declaration (default 2)
 * @param {number} bonuses.kongCount
 * @param {boolean} bonuses.completeAnimalSet
 * @param {boolean} bonuses.completeSeasonSet
 * @param {boolean} bonuses.completeFlowerSet
 * @param {string[]} playerIds
 * @param {string} receiverId
 * @returns {{ exchanges: { from: string, to: string, amount: number }[] }}
 */
export function calculateBonuses(bonuses, playerIds, receiverId) {
  const exchanges = []
  const payers = playerIds.filter(id => id !== receiverId)

  const flatPerPlayer =
    (bonuses.kongCount ?? 0) * (bonuses.kongPoints ?? 2) +
    (bonuses.completeAnimalSet ? 4 : 0) +
    (bonuses.completeSeasonSet ? 4 : 0) +
    (bonuses.completeFlowerSet ? 4 : 0)

  if (flatPerPlayer > 0) {
    for (const payer of payers) {
      exchanges.push({ from: payer, to: receiverId, amount: flatPerPlayer })
    }
  }

  return { exchanges }
}
