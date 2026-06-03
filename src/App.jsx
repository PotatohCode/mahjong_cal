import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import GameSession from './pages/GameSession'
import RoundCalculator from './pages/RoundCalculator'
import History from './pages/History'
import SessionDetail from './pages/SessionDetail'
import Players from './pages/Players'
import BonusEntry from './pages/BonusEntry'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="game/:id" element={<GameSession />} />
        <Route path="game/:id/round" element={<RoundCalculator />} />
        <Route path="game/:id/bonus" element={<BonusEntry />} />
        <Route path="history" element={<History />} />
        <Route path="history/:id" element={<SessionDetail />} />
        <Route path="players" element={<Players />} />
      </Route>
    </Routes>
  )
}
