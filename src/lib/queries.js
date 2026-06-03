import { client } from './sanityClient'

// Players
export const fetchPlayers = () =>
  client.fetch(`*[_type == "player"] | order(name asc) { _id, name, createdAt }`)

export const createPlayer = (name) =>
  client.create({ _type: 'player', name, createdAt: new Date().toISOString() })

// Game sessions
export const fetchSessions = () =>
  client.fetch(`
    *[_type == "gameSession"] | order(startedAt desc) {
      _id, startedAt, completedAt, minTai, maxTai, startingPoints, base, shooterPay,
      players[]->{ _id, name }
    }
  `)

export const fetchSession = (id) =>
  client.fetch(
    `*[_type == "gameSession" && _id == $id][0] {
      _id, startedAt, completedAt, minTai, maxTai, startingPoints, base, shooterPay,
      players[]->{ _id, name }
    }`,
    { id }
  )

export const createSession = ({ playerIds, startingPoints, minTai, maxTai, base, shooterPay }) =>
  client.create({
    _type: 'gameSession',
    players: playerIds.map(id => ({ _type: 'reference', _ref: id })),
    startingPoints,
    minTai,
    maxTai,
    base,
    shooterPay,
    startedAt: new Date().toISOString(),
  })

export const completeSession = (id) =>
  client.patch(id).set({ completedAt: new Date().toISOString() }).commit()

// Rounds
export const fetchRounds = (sessionId) =>
  client.fetch(
    `*[_type == "round" && session._ref == $sessionId] | order(roundNumber asc) {
      _id, roundNumber, winType, totalTai, taiBreakdown, pointsExchanged, shooterPay, timestamp,
      winner->{ _id, name },
      discarder->{ _id, name }
    }`,
    { sessionId }
  )

export const createRound = (round) =>
  client.create({ _type: 'round', ...round, timestamp: new Date().toISOString() })

// Bonuses
export const fetchBonuses = (sessionId) =>
  client.fetch(
    `*[_type == "bonus" && session._ref == $sessionId] | order(timestamp asc) {
      _id, bonusType, bonusLabel, pointsPerPlayer, exchanges, roundContext, timestamp,
      player->{ _id, name }
    }`,
    { sessionId }
  )

export const createBonus = (bonus) =>
  client.create({ _type: 'bonus', ...bonus, timestamp: new Date().toISOString() })
