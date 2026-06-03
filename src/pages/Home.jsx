import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchPlayers, fetchSessions, createSession } from '../lib/queries'

export default function Home() {
  const navigate = useNavigate()
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers })
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: fetchSessions })

  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [startingPoints, setStartingPoints] = useState(100)
  const [minTai, setMinTai] = useState(1)
  const [maxTai, setMaxTai] = useState(5)
  const [base, setBase] = useState(2)
  const [shooterPay, setShooterPay] = useState(false)

  const mutation = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => navigate(`/game/${session._id}`),
  })

  const togglePlayer = (id) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const handleStart = () => {
    if (selectedPlayers.length < 2) return
    mutation.mutate({ playerIds: selectedPlayers, startingPoints, minTai, maxTai, base, shooterPay })
  }

  const activeGames = sessions.filter(s => !s.completedAt)

  return (
    <div className="space-y-6">
      {activeGames.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Resume Game</h2>
          <div className="space-y-2">
            {activeGames.map(s => (
              <button
                key={s._id}
                onClick={() => navigate(`/game/${s._id}`)}
                className="w-full text-left bg-yellow-50 border border-yellow-300 rounded px-4 py-3 hover:bg-yellow-100"
              >
                <div className="font-medium">{s.players?.map(p => p.name).join(', ')}</div>
                <div className="text-sm text-gray-500">{new Date(s.startedAt).toLocaleDateString()} · In Progress</div>
              </button>
            ))}
          </div>
        </section>
      )}

      <h1 className="text-2xl font-bold">New Game</h1>

      <section>
        <h2 className="font-semibold mb-2">Select Players (2–4)</h2>
        <div className="grid grid-cols-2 gap-2">
          {players.map(p => (
            <button
              key={p._id}
              onClick={() => togglePlayer(p._id)}
              className={`p-3 rounded border text-left ${
                selectedPlayers.includes(p._id)
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {players.length === 0 && (
          <p className="text-sm text-gray-500">
            No players yet. <Link to="/players" className="underline">Add players first.</Link>
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Game Settings</h2>
        <label className="flex justify-between items-center">
          <span className="text-sm">Starting Points</span>
          <input
            type="number"
            value={startingPoints}
            onChange={e => setStartingPoints(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-sm"
          />
        </label>
        <label className="flex justify-between items-center">
          <span className="text-sm">Minimum Tai</span>
          <input
            type="number"
            value={minTai}
            min={0}
            max={maxTai}
            onChange={e => setMinTai(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-sm"
          />
        </label>
        <label className="flex justify-between items-center">
          <span className="text-sm">Maximum Tai</span>
          <input
            type="number"
            value={maxTai}
            min={minTai}
            onChange={e => setMaxTai(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-sm"
          />
        </label>
        <label className="flex justify-between items-center">
          <span className="text-sm">Base Points</span>
          <input
            type="number"
            value={base}
            min={1}
            onChange={e => setBase(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-sm"
          />
        </label>
        <label className="flex justify-between items-center">
          <span className="text-sm">Shooter Pay</span>
          <input
            type="checkbox"
            checked={shooterPay}
            onChange={e => setShooterPay(e.target.checked)}
            className="w-5 h-5"
          />
        </label>
      </section>

      <button
        onClick={handleStart}
        disabled={selectedPlayers.length < 2 || mutation.isPending}
        className="w-full py-3 bg-green-600 text-white rounded font-semibold disabled:opacity-50"
      >
        {mutation.isPending ? 'Starting…' : 'Start Game'}
      </button>
    </div>
  )
}
