import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchSession, fetchRounds, fetchBonuses, completeSession } from '../lib/queries'

export default function GameSession() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: session } = useQuery({ queryKey: ['session', id], queryFn: () => fetchSession(id) })
  const { data: rounds = [] } = useQuery({ queryKey: ['rounds', id], queryFn: () => fetchRounds(id) })
  const { data: bonuses = [] } = useQuery({ queryKey: ['bonuses', id], queryFn: () => fetchBonuses(id) })

  const endMutation = useMutation({
    mutationFn: () => completeSession(id),
    onSuccess: () => navigate(`/history/${id}`),
  })

  if (!session) return <p className="text-gray-500">Loading…</p>

  // Running totals from round wins + mid-round bonuses
  const totals = Object.fromEntries(session.players.map(p => [p._id, session.startingPoints]))
  for (const round of rounds) {
    for (const ex of round.pointsExchanged ?? []) {
      totals[ex.from] -= ex.amount
      totals[ex.to] += ex.amount
    }
  }
  for (const bonus of bonuses) {
    for (const ex of bonus.exchanges ?? []) {
      totals[ex.from] -= ex.amount
      totals[ex.to] += ex.amount
    }
  }

  // Bonuses that belong to the current (unfinished) round
  const currentRound = rounds.length + 1
  const currentRoundBonuses = bonuses.filter(b => b.roundContext === currentRound)

  const handleEndGame = () => {
    if (window.confirm('End this game? This cannot be undone.')) {
      endMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Game in Progress</h1>
        <span className="text-sm text-gray-500">Round {currentRound}</span>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Scores</h2>
        <div className="space-y-2">
          {session.players
            .slice()
            .sort((a, b) => totals[b._id] - totals[a._id])
            .map(p => (
              <div key={p._id} className="flex justify-between items-center bg-white border rounded px-4 py-3">
                <span>{p.name}</span>
                <span className={`font-mono font-semibold ${totals[p._id] >= session.startingPoints ? 'text-green-600' : 'text-red-500'}`}>
                  {totals[p._id]}
                </span>
              </div>
            ))}
        </div>
      </section>

      {currentRoundBonuses.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Bonuses this round</h2>
          <div className="space-y-1">
            {currentRoundBonuses.map(b => (
              <div key={b._id} className="text-sm flex justify-between bg-blue-50 border border-blue-200 rounded px-3 py-2">
                <span>{b.player?.name} — {b.bonusLabel}</span>
                <span className="text-gray-500">+{b.pointsPerPlayer} each</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {rounds.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Completed rounds</h2>
          <div className="space-y-1">
            {rounds.map(r => (
              <div key={r._id} className="text-sm flex justify-between bg-white border rounded px-3 py-2">
                <span>R{r.roundNumber} — {r.winner?.name} wins ({r.totalTai} tai)</span>
                <span className="text-gray-500 capitalize">{r.winType?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/game/${id}/bonus`)}
          className="flex-1 py-3 bg-blue-600 text-white rounded font-semibold"
        >
          Record Bonus
        </button>
        <button
          onClick={() => navigate(`/game/${id}/round`)}
          className="flex-1 py-3 bg-green-600 text-white rounded font-semibold"
        >
          End Round
        </button>
      </div>

      <button
        onClick={handleEndGame}
        disabled={endMutation.isPending}
        className="w-full py-3 bg-red-600 text-white rounded font-semibold disabled:opacity-50"
      >
        {endMutation.isPending ? 'Ending…' : 'End Game'}
      </button>
    </div>
  )
}
