import { describe, it, expect, beforeEach } from 'vitest'
import { LINES, newGame, move, undo, GameState, Board } from './engine'
import { bestMove, minimaxMove } from './ai'
import { emptyStats, record, winPct } from './stats'

const play = (...m: number[]) => m.reduce(move, newGame())

describe('engine', () => {
  it.each(LINES)('detects win on %j', (a, b, c) => {
    const other = [0,1,2,3,4,5,6,7,8].filter((i) => ![a, b, c].includes(i))
    const s = play(a, other[0], b, other[1], c)
    expect(s.winner).toBe('X'); expect(s.line).toEqual([a, b, c])
  })
  it('detects a draw', () => {
    const s = play(0, 1, 2, 4, 3, 5, 7, 6, 8)
    expect(s.draw).toBe(true); expect(s.winner).toBeNull()
  })
  it('rejects occupied, out-of-range and post-game moves', () => {
    const s = play(0)
    expect(move(s, 0)).toBe(s); expect(move(s, 9)).toBe(s)
    const won = play(0, 3, 1, 4, 2)
    expect(move(won, 8)).toBe(won)
  })
  it('alternates players', () => {
    expect(play(0).current).toBe('O'); expect(play(0, 1).current).toBe('X')
  })
  it('undo restores board, player, status and history', () => {
    const won = play(0, 3, 1, 4, 2)
    const u = undo(won)
    expect(u).toEqual(play(0, 3, 1, 4)); expect(u.winner).toBeNull()
    expect(undo(newGame())).toEqual(newGame())
  })
})

describe('ai', () => {
  it('takes a winning move', () => {
    const b: Board = ['O','O',null,'X','X',null,null,null,null]
    expect(minimaxMove(b, 'O')).toBe(2)
  })
  it('blocks a losing move', () => {
    const b: Board = ['X','X',null,null,'O',null,null,null,null]
    expect(minimaxMove(b, 'O')).toBe(2)
    expect(bestMove(b, 'O', 'medium')).toBe(2)
  })
  it('hard AI never loses as O or X against every opponent line', () => {
    const explore = (s: GameState, ai: 'X' | 'O') => {
      if (s.winner) { expect(s.winner).toBe(ai); return }
      if (s.draw) return
      if (s.current === ai) explore(move(s, bestMove(s.board, ai, 'hard')), ai)
      else s.board.forEach((c, i) => { if (!c) explore(move(s, i), ai) })
    }
    explore(newGame(), 'X'); explore(newGame(), 'O')
  })
})

describe('stats', () => {
  it('computes counts, streaks and percentage', () => {
    let s = emptyStats()
    s = record(record(record(s, 'X'), 'X'), 'O'); s = record(s, null)
    expect(s).toMatchObject({ x: 2, o: 1, draws: 1, streak: 0, best: 2 })
    expect(winPct(s)).toBe(50); expect(winPct(emptyStats())).toBe(0)
  })
})

describe('localStorage persistence', () => {
  const store: Record<string, string> = {}
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k])
    ;(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v } }
  })
  it('round-trips stats', () => {
    localStorage.setItem('s', JSON.stringify(record(emptyStats(), 'X')))
    expect(JSON.parse(localStorage.getItem('s')!).x).toBe(1)
  })
})
