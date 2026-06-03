import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPlayers, createPlayer } from '../lib/queries'

export default function Players() {
  const queryClient = useQueryClient()
  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers })
  const [name, setName] = useState('')

  const mutation = useMutation({
    mutationFn: () => createPlayer(name.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      setName('')
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Players</h1>

      <form
        onSubmit={e => { e.preventDefault(); if (name.trim()) mutation.mutate() }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Player name"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={!name.trim() || mutation.isPending}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {players.map(p => (
          <div key={p._id} className="bg-white border rounded px-4 py-3">
            {p.name}
          </div>
        ))}
        {players.length === 0 && <p className="text-gray-500 text-sm">No players yet.</p>}
      </div>
    </div>
  )
}
