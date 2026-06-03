import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSession, fetchRounds, createBonus } from '../lib/queries'
import { BONUS_TYPES, buildBonusExchanges } from '../engine/bonusTypes'

export default function BonusEntry() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: session } = useQuery({ queryKey: ['session', id], queryFn: () => fetchSession(id) })
  const { data: rounds = [] } = useQuery({ queryKey: ['rounds', id], queryFn: () => fetchRounds(id) })

  const [recipientId, setRecipientId] = useState('')
  const [bonusKey, setBonusKey] = useState('')
  const [discarderOnly, setDiscarderOnly] = useState(false)
  const [discarderId, setDiscarderId] = useState('')

  const mutation = useMutation({
    mutationFn: createBonus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses', id] })
      navigate(`/game/${id}`)
    },
  })

  if (!session) return <p className="text-gray-500">Loading…</p>

  const base = session.base ?? 2
  const playerIds = session.players.map(p => p._id)
  const selectedBonus = bonusKey ? BONUS_TYPES[bonusKey] : null
  const pointsPerPlayer = selectedBonus ? selectedBonus.getPoints(base) : 0

  const effectiveDiscarderId = discarderOnly && selectedBonus?.hasDiscarderOption ? discarderId : null
  const exchanges = recipientId && selectedBonus
    ? buildBonusExchanges(recipientId, playerIds, pointsPerPlayer, effectiveDiscarderId || null)
    : []

  const canConfirm =
    recipientId &&
    bonusKey &&
    (!discarderOnly || !selectedBonus?.hasDiscarderOption || discarderId) &&
    !mutation.isPending

  const playerName = (pid) => session.players.find(p => p._id === pid)?.name ?? pid

  const handleBonusKeyChange = (key) => {
    setBonusKey(key)
    setDiscarderOnly(false)
    setDiscarderId('')
  }

  const handleConfirm = () => {
    if (!canConfirm) return
    mutation.mutate({
      session: { _type: 'reference', _ref: id },
      player: { _type: 'reference', _ref: recipientId },
      bonusType: selectedBonus.key,
      bonusLabel: selectedBonus.label,
      pointsPerPlayer,
      discarderOnly: discarderOnly && !!selectedBonus.hasDiscarderOption,
      discarder: effectiveDiscarderId ? { _type: 'reference', _ref: effectiveDiscarderId } : undefined,
      exchanges,
      roundContext: rounds.length + 1,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/game/${id}`)} className="text-gray-500 hover:text-gray-800">← Back</button>
        <h1 className="text-2xl font-bold">Record Bonus</h1>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Who receives the bonus?</h2>
        <div className="grid grid-cols-2 gap-2">
          {session.players.map(p => (
            <button
              key={p._id}
              onClick={() => setRecipientId(p._id)}
              className={`p-3 rounded border text-left ${recipientId === p._id ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Bonus type</h2>
        <div className="space-y-1">
          {Object.values(BONUS_TYPES).map(b => (
            <button
              key={b.key}
              onClick={() => handleBonusKeyChange(b.key)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded border text-left ${bonusKey === b.key ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
            >
              <span className="text-sm">{b.label}</span>
              <span className="text-sm text-gray-500">{b.getPoints(base)} pts each</span>
            </button>
          ))}
        </div>
      </section>

      {selectedBonus?.hasDiscarderOption && (
        <section className="space-y-2">
          <label className="flex items-center gap-2 bg-gray-50 border rounded px-3 py-2">
            <input
              type="checkbox"
              checked={discarderOnly}
              onChange={e => { setDiscarderOnly(e.target.checked); setDiscarderId('') }}
            />
            <span className="text-sm">Discarder pays only</span>
          </label>

          {discarderOnly && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Select discarder</p>
              <div className="grid grid-cols-2 gap-2">
                {session.players.filter(p => p._id !== recipientId).map(p => (
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
        </section>
      )}

      {exchanges.length > 0 && (
        <section className="bg-white border rounded p-4 space-y-2">
          <p className="font-semibold text-sm">Payment preview</p>
          {exchanges.map((ex, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{playerName(ex.from)} → {playerName(ex.to)}</span>
              <span className="font-mono">{ex.amount} pts</span>
            </div>
          ))}
        </section>
      )}

      <button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="w-full py-3 bg-green-600 text-white rounded font-semibold disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving…' : 'Confirm Bonus'}
      </button>
    </div>
  )
}
