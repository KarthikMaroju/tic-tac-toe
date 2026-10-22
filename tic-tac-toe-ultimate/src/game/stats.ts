import { Player } from './engine'
export interface Stats { x: number; o: number; draws: number; streak: number; best: number }
export const emptyStats = (): Stats => ({ x: 0, o: 0, draws: 0, streak: 0, best: 0 })
export const total = (s: Stats) => s.x + s.o + s.draws
/** Win % = X wins / total games, rounded; 0 when no games. Streak = consecutive X wins. */
export const winPct = (s: Stats) => (total(s) ? Math.round((s.x / total(s)) * 100) : 0)
export function record(s: Stats, winner: Player | null): Stats {
  if (winner === 'X') { const streak = s.streak + 1; return { ...s, x: s.x + 1, streak, best: Math.max(s.best, streak) } }
  if (winner === 'O') return { ...s, o: s.o + 1, streak: 0 }
  return { ...s, draws: s.draws + 1, streak: 0 }
}
