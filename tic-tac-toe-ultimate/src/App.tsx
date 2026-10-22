import { useEffect, useState } from 'react'
import { newGame, move, undo } from './game/engine'
import { bestMove, Level } from './game/ai'
import { Stats, emptyStats, record, winPct, total } from './game/stats'

type Mode = 'pvp' | Level
function useLS<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* storage unavailable */ } }, [key, v])
  return [v, setV] as const
}

export default function App() {
  const [mode, setMode] = useLS<Mode>('ttt-mode', 'pvp')
  const [theme, setTheme] = useLS<'dark' | 'light'>('ttt-theme', 'dark')
  const [name1, setName1] = useLS('ttt-name1', 'Player 1')
  const [name2, setName2] = useLS('ttt-name2', 'Player 2')
  const [all, setAll] = useLS<Record<string, Stats>>('ttt-stats', {})
  const [s, setS] = useState(newGame)
  const vsCpu = mode !== 'pvp'
  const st = all[mode] ?? emptyStats()
  const finished = !!s.winner || s.draw
  const oName = vsCpu ? `Computer (${mode})` : name2

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => {
    if (!vsCpu || finished || s.current !== 'O') return
    const t = setTimeout(() => setS((p) => move(p, bestMove(p.board, 'O', mode as Level))), 400)
    return () => clearTimeout(t)
  }, [vsCpu, finished, s.current, mode])
  useEffect(() => {
    if (finished) setAll((p) => ({ ...p, [mode]: record(p[mode] ?? emptyStats(), s.winner) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const changeMode = (m: Mode) => { setMode(m); setS(newGame()) }
  const click = (i: number) => { if (!(vsCpu && s.current === 'O')) setS((p) => move(p, i)) }
  // vs computer: undo removes the AI reply and the human move before it (1 move if the human's move ended the game)
  const doUndo = () => setS((p) => undo(p, vsCpu && p.history.length % 2 === 0 ? 2 : 1))
  const resetStats = () => { if (confirm('Reset statistics for this mode?')) setAll((p) => ({ ...p, [mode]: emptyStats() })) }

  const status = s.winner ? `${s.winner === 'X' ? name1 : oName} wins` : s.draw ? 'Draw' : `${s.current === 'X' ? name1 : oName}'s turn`
  return (
    <main className="app">
      <header>
        <h1>Tic-Tac-Toe</h1>
        <button className="btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</button>
      </header>
      <label className="row">Mode
        <select value={mode} onChange={(e) => changeMode(e.target.value as Mode)}>
          <option value="pvp">Player vs Player</option><option value="easy">Computer · Easy</option>
          <option value="medium">Computer · Medium</option><option value="hard">Computer · Hard (Minimax)</option>
        </select>
      </label>
      <div className="row">
        <input aria-label="Player X name" value={name1} maxLength={14} onChange={(e) => setName1(e.target.value)} />
        {vsCpu ? <span className="cpu">{oName}</span> : <input aria-label="Player O name" value={name2} maxLength={14} onChange={(e) => setName2(e.target.value)} />}
      </div>
      <p className="status" role="status" aria-live="polite">{status}</p>
      <div className="board" role="grid" aria-label="Game board">
        {s.board.map((c, i) => (
          <button key={i} className={`cell ${c ?? ''} ${s.line?.includes(i) ? 'win' : ''}`} disabled={!!c || finished}
            aria-label={`Cell ${i + 1}, ${c ?? 'empty'}`} onClick={() => click(i)}>
            {c && <span className="mark">{c}</span>}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn" onClick={doUndo} disabled={!s.history.length || (vsCpu && s.current === 'O' && !finished)}>Undo</button>
        <button className="btn primary" onClick={() => setS(newGame())}>{finished ? 'Rematch' : 'Restart'}</button>
      </div>
      <p className="hist" aria-label="Move history">{s.history.length ? s.history.map((m, i) => `${i % 2 ? 'O' : 'X'}${m + 1}`).join('  ') : 'No moves yet. Pick a cell to start.'}</p>
      <section className="stats" aria-label="Statistics">
        <div><b>{st.x}</b>X wins</div><div><b>{st.o}</b>O wins</div><div><b>{st.draws}</b>Draws</div>
        <div><b>{total(st)}</b>Games</div><div><b>{winPct(st)}%</b>X win rate</div><div><b>{st.streak}/{st.best}</b>Streak/best</div>
      </section>
      <button className="btn" onClick={resetStats}>Reset statistics</button>
    </main>
  )
}
