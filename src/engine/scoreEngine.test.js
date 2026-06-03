import { describe, it, expect } from 'vitest'
import { calculateTai, calculatePoints, WIN_TYPE } from './scoreEngine'

describe('calculateTai', () => {
  it('sums tai sources correctly', () => {
    const { totalTai } = calculateTai(['DRAGON_PONG', 'ALL_CHOW'])
    expect(totalTai).toBe(2)
  })

  it('caps at maxTai', () => {
    const { totalTai, capped } = calculateTai(
      ['ALL_TERMINAL', 'FULL_COLOR'],
      {},
      5
    )
    expect(totalTai).toBe(5)
    expect(capped).toBe(true)
  })

  it('handles repeatable sources', () => {
    const { totalTai } = calculateTai(['ANIMAL_TILE'], { ANIMAL_TILE: 3 }, 5)
    expect(totalTai).toBe(3)
  })

  it('returns 0 for empty sources', () => {
    const { totalTai } = calculateTai([])
    expect(totalTai).toBe(0)
  })
})

describe('calculatePoints', () => {
  const players = ['p1', 'p2', 'p3', 'p4']

  it('self-draw: all three losers pay double base', () => {
    // base=2, 3 tai → 2 × 2^2 = 8 basePoints
    const { basePoints, exchanges } = calculatePoints(3, WIN_TYPE.SELF_DRAW, players, 'p1')
    expect(basePoints).toBe(8)
    expect(exchanges).toHaveLength(3)
    expect(exchanges.every(e => e.amount === 16)).toBe(true)
    expect(exchanges.every(e => e.to === 'p1')).toBe(true)
  })

  it('discard: discarder pays double, others pay single', () => {
    const { basePoints, exchanges } = calculatePoints(3, WIN_TYPE.DISCARD, players, 'p1', 'p2')
    expect(basePoints).toBe(8)
    const discarderEx = exchanges.find(e => e.from === 'p2')
    const otherEx = exchanges.filter(e => e.from !== 'p2')
    expect(discarderEx.amount).toBe(16)
    expect(otherEx.every(e => e.amount === 8)).toBe(true)
  })

  it('0 tai returns the base value', () => {
    const { basePoints } = calculatePoints(0, WIN_TYPE.SELF_DRAW, players, 'p1')
    expect(basePoints).toBe(2) // default base=2
  })

  it('pay-all: one player pays all opponents', () => {
    const { exchanges } = calculatePoints(3, WIN_TYPE.DISCARD, players, 'p1', 'p2', true)
    expect(exchanges.every(e => e.from === 'p2')).toBe(true)
    expect(exchanges).toHaveLength(3)
  })

  it('shooter pay: discarder pays basePoints×4 to winner only', () => {
    const { basePoints, exchanges } = calculatePoints(3, WIN_TYPE.DISCARD, players, 'p1', 'p2', false, true)
    expect(basePoints).toBe(8)
    expect(exchanges).toHaveLength(1)
    expect(exchanges[0]).toEqual({ from: 'p2', to: 'p1', amount: 32 }) // 8 * 4
  })

  it('base=1: each tai doubles from 1 (1,2,4,8,16)', () => {
    const pts = [1, 2, 3, 4, 5].map(tai =>
      calculatePoints(tai, WIN_TYPE.SELF_DRAW, players, 'p1', null, false, false, 1).basePoints
    )
    expect(pts).toEqual([1, 2, 4, 8, 16])
  })

  it('base=3: each tai doubles from 3 (3,6,12,24)', () => {
    const pts = [1, 2, 3, 4].map(tai =>
      calculatePoints(tai, WIN_TYPE.SELF_DRAW, players, 'p1', null, false, false, 3).basePoints
    )
    expect(pts).toEqual([3, 6, 12, 24])
  })

  it('default base=2 produces same results as before', () => {
    const { basePoints } = calculatePoints(3, WIN_TYPE.SELF_DRAW, players, 'p1')
    expect(basePoints).toBe(8) // 2 × 2^2 = 8
  })
})
