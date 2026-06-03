import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSession, fetchRounds, createRound } from '../lib/queries'
import { calculateTai, calculatePoints, TAI_SOURCES, WIN_TYPE } from '../engine/scoreEngine'

const CATEGORIES = [
  { key: 'tile', label: 'Tile Tai (winner)' },
  { key: 'hand', label: 'Hand Type' },
  { key: 'special', label: 'Special Hands' },
  { key: 'circumstance', label: 'Circumstance' },
]

export default function RoundCalculator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: session } = useQuery({ queryKey: ['session', id], queryFn: () => fetchSession(id) })
  const { data: rounds = [] } = useQuery({ queryKey: ['rounds', id], queryFn: () => fetchRounds(id) })

  const [winnerId, setWinnerId] = useState('')
  const [winType, setWinType] = useState(WIN_TYPE.SELF_DRAW)
  const [discarderId, setDiscarderId] = useState('')
  const [activeSources, setActiveSources] = useState([])
  const [counts, setCounts] = useState({})
  const [payAll, setPayAll] = useState(false)

  const mutation = useMutation({
    mutationFn: createRound,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds', id] })
      navigate(`/game/${id}`)
    },
  })

  if (!session) return <p className="text-gray-500">Loading…</p>

  const shooterPay = session.shooterPay ?? false
  const base = session.base ?? 2

  const { totalTai, breakdown, capped } = calculateTai(activeSources, counts, session.maxTai)
  const playerIds = session.players.map(p => p._id)
  const { basePoints, exchanges } = winnerId
    ? calculatePoints(totalTai, winType, playerIds, winnerId, discarderId || null, payAll, shooterPay && winType === WIN_TYPE.DISCARD && !!discarderId, base)
    : { basePoints: 0, exchanges: [] }

  const toggleSource = (key) => {
    setActiveSources(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleWinTypeChange = (wt) => {
    setWinType(wt)
    if (wt === WIN_TYPE.SELF_DRAW) {
      setDiscarderId('')
      setPayAll(false)
    }
  }

  const handleSubmit = () => {
    if (!winnerId) return
    const roundNumber = rounds.length + 1
    mutation.mutate({
      session: { _type: 'reference', _ref: id },
      roundNumber,
      winner: { _type: 'reference', _ref: winnerId },
      winType,
      discarder: discarderId ? { _type: 'reference', _ref: discarderId } : undefined,
      taiBreakdown: breakdown,
      totalTai,
      shooterPay,
      pointsExchanged: exchanges,
    })
  }

  const playerName = (pid) => session.players.find(p => p._id === pid)?.name ?? pid

  const showDiscarderOptions = winType === WIN_TYPE.DISCARD
  const activeShooterPay = shooterPay && showDiscarderOptions && !!discarderId
  const showPayAll = showDiscarderOptions && !!discarderId && !activeShooterPay

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Round {rounds.length + 1}</h1>

      {/* Winner */}
      <section>
        <h2 className="font-semibold mb-2">Winner</h2>
        <div className="grid grid-cols-2 gap-2">
          {session.players.map(p => (
            <button
              key={p._id}
              onClick={() => setWinnerId(p._id)}
              className={`p-3 rounded border text-left ${winnerId === p._id ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      {/* Win type */}
      <section>
        <h2 className="font-semibold mb-2">Win Type</h2>
        <div className="flex gap-2">
          {[WIN_TYPE.SELF_DRAW, WIN_TYPE.DISCARD].map(wt => (
            <button
              key={wt}
              onClick={() => handleWinTypeChange(wt)}
              className={`flex-1 py-2 rounded border ${winType === wt ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
            >
              {wt === WIN_TYPE.SELF_DRAW ? 'Self Draw' : 'Discard'}
            </button>
          ))}
        </div>

        {showDiscarderOptions && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Discarder</p>
            <div className="grid grid-cols-2 gap-2">
              {session.players.filter(p => p._id !== winnerId).map(p => (
                <button
                  key={p._id}
                  onClick={() => setDiscarderId(p._id)}
                  className={`p-2 rounded border text-sm ${discarderId === p._id ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeShooterPay && (
          <div className="mt-2 bg-orange-50 border border-orange-300 rounded px-3 py-2">
            <span className="text-sm font-medium text-orange-700">Shooter Pay active</span>
            <p className="text-xs text-gray-500">Discarder pays base points ×4 to winner; others pay nothing</p>
          </div>
        )}

        {showPayAll && (
          <label className="flex items-center gap-2 mt-2 bg-yellow-50 border border-yellow-300 rounded px-3 py-2">
            <input type="checkbox" checked={payAll} onChange={e => setPayAll(e.target.checked)} />
            <span className="text-sm">Pay-All scenario</span>
          </label>
        )}
      </section>

      {/* Tai builder */}
      {CATEGORIES.map(cat => {
        const sources = Object.values(TAI_SOURCES).filter(s => s.category === cat.key)
        return (
          <section key={cat.key}>
            <h2 className="font-semibold mb-2">{cat.label}</h2>
            <div className="space-y-1">
              {sources.map(source => (
                <label key={source.key} className="flex items-center justify-between bg-white border rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeSources.includes(source.key)}
                      onChange={() => toggleSource(source.key)}
                    />
                    <span className="text-sm">{source.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {source.repeatable && activeSources.includes(source.key) && (
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={counts[source.key] ?? 1}
                        onChange={e => setCounts(prev => ({ ...prev, [source.key]: Number(e.target.value) }))}
                        className="w-12 border rounded px-1 py-0.5 text-sm text-center"
                      />
                    )}
                    <span className="text-sm text-gray-500">+{source.tai}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        )
      })}

      {/* Preview */}
      <section className="bg-white border rounded p-4 space-y-2">
        <div className="flex justify-between font-semibold">
          <span>Total Tai</span>
          <span>{totalTai}{capped ? ' (capped)' : ''}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Base Points ({base} × 2^{totalTai > 0 ? totalTai - 1 : 0})</span>
          <span>{basePoints}</span>
        </div>
        {activeShooterPay && (
          <p className="text-xs text-orange-600">Shooter Pay — discarder pays ×4, others pay nothing</p>
        )}
        {exchanges.map((ex, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{playerName(ex.from)} → {playerName(ex.to)}</span>
            <span className="font-mono">{ex.amount} pts</span>
          </div>
        ))}
      </section>

      <button
        onClick={handleSubmit}
        disabled={!winnerId || (winType === WIN_TYPE.DISCARD && !discarderId) || mutation.isPending}
        className="w-full py-3 bg-green-600 text-white rounded font-semibold disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving…' : 'Confirm Round'}
      </button>
    </div>
  )
}
