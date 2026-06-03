import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSession, fetchRounds } from '../lib/queries'

export default function SessionDetail() {
  const { id } = useParams()
  const { data: session } = useQuery({ queryKey: ['session', id], queryFn: () => fetchSession(id) })
  const { data: rounds = [] } = useQuery({ queryKey: ['rounds', id], queryFn: () => fetchRounds(id) })

  if (!session) return <p className="text-gray-500">Loading…</p>

  const totals = Object.fromEntries(session.players.map(p => [p._id, session.startingPoints]))
  for (const round of rounds) {
    for (const ex of round.pointsExchanged ?? []) {
      totals[ex.from] -= ex.amount
      totals[ex.to] += ex.amount
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Session Detail</h1>
      <div className="text-sm text-gray-500 space-y-0.5">
        <p>{new Date(session.startedAt).toLocaleString()}</p>
        <p>Base: {session.base ?? 2} · Min {session.minTai} tai · Max {session.maxTai} tai{session.shooterPay ? ' · Shooter Pay on' : ''}</p>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Final Scores</h2>
        {session.players
          .slice()
          .sort((a, b) => totals[b._id] - totals[a._id])
          .map(p => (
            <div key={p._id} className="flex justify-between bg-white border rounded px-4 py-2 mb-1">
              <span>{p.name}</span>
              <span className={`font-mono font-semibold ${totals[p._id] >= session.startingPoints ? 'text-green-600' : 'text-red-500'}`}>
                {totals[p._id]}
              </span>
            </div>
          ))}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Rounds ({rounds.length})</h2>
        {rounds.map(r => (
          <div key={r._id} className="bg-white border rounded px-4 py-3 mb-2">
            <div className="flex justify-between font-medium">
              <span>Round {r.roundNumber} — {r.winner?.name}</span>
              <span className="text-sm text-gray-500">{r.totalTai} tai</span>
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {r.winType?.replace('_', ' ')}
              {r.discarder ? ` (discard by ${r.discarder.name})` : ''}
            </div>
            <div className="mt-2 space-y-0.5">
              {(r.taiBreakdown ?? []).map((b, i) => (
                <div key={i} className="text-xs text-gray-500 flex justify-between">
                  <span>{b.label}{b.count > 1 ? ` ×${b.count}` : ''}</span>
                  <span>+{b.tai}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
