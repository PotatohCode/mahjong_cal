// hasDiscarderOption: true means only the discarder can pay instead of all players
export const BONUS_TYPES = {
  KONG: {
    key: 'KONG',
    label: 'Kong Declaration',
    getPoints: (m) => m,
    hasDiscarderOption: true,
  },
  ANIMAL_TILE: {
    key: 'ANIMAL_TILE',
    label: 'Animal Tile',
    getPoints: (m) => m,
    hasDiscarderOption: true,
  },
  ANIMAL_TILE_INITIAL: {
    key: 'ANIMAL_TILE_INITIAL',
    label: 'Animal Tile (initial hand)',
    getPoints: (m) => m * 2,
    hasDiscarderOption: true,
  },
  COMPLETE_ANIMAL_SET: {
    key: 'COMPLETE_ANIMAL_SET',
    label: 'Complete Animal Set',
    getPoints: (m) => m * 2,
    hasDiscarderOption: false,
  },
  COMPLETE_FLOWER_SET: {
    key: 'COMPLETE_FLOWER_SET',
    label: 'Complete Flower Set',
    getPoints: (m) => m * 2,
    hasDiscarderOption: false,
  },
  COMPLETE_SEASON_SET: {
    key: 'COMPLETE_SEASON_SET',
    label: 'Complete Season Set',
    getPoints: (m) => m * 2,
    hasDiscarderOption: false,
  },
}

/**
 * Build point exchanges for a mid-round bonus.
 *
 * @param {string} recipientId - Player receiving points
 * @param {string[]} playerIds - All player IDs
 * @param {number} pointsPerPlayer - Amount each payer sends
 * @param {string|null} discarderId - If set, only this player pays
 */
export function buildBonusExchanges(recipientId, playerIds, pointsPerPlayer, discarderId = null) {
  const payers = discarderId
    ? [discarderId]
    : playerIds.filter(id => id !== recipientId)
  return payers.map(id => ({ from: id, to: recipientId, amount: pointsPerPlayer }))
}
