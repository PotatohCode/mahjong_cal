import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSessions } from '../lib/queries'

export default function History() {
  const navigate = useNavigate()
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: fetchSessions })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">History</h1>
      {sessions.length === 0 && <p className="text-gray-500">No games played yet.</p>}
      {sessions.map(s => (
        <button
          key={s._id}
          onClick={() => navigate(`/history/${s._id}`)}
          className="w-full text-left bg-white border rounded px-4 py-3 hover:bg-gray-50"
        >
          <div className="flex justify-between">
            <span className="font-medium">{s.players?.map(p => p.name).join(', ')}</span>
            <span className="text-sm text-gray-500">{s.completedAt ? 'Completed' : 'In Progress'}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {new Date(s.startedAt).toLocaleDateString()} · Min {s.minFan} fan · Max {s.maxFan} fan
          </div>
        </button>
      ))}
    </div>
  )
}
