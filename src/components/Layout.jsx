import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  const linkClass = ({ isActive }) =>
    isActive ? 'font-semibold text-green-600' : 'text-gray-600 hover:text-gray-900'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="text-lg font-bold text-gray-900">
          Mahjong Calculator
        </NavLink>
        <nav className="flex gap-4 text-sm">
          <NavLink to="/" end className={linkClass}>New Game</NavLink>
          <NavLink to="/history" className={linkClass}>History</NavLink>
          <NavLink to="/players" className={linkClass}>Players</NavLink>
        </nav>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
