import { Board, Player, evaluate, other } from './engine'
export type Level = 'easy' | 'medium' | 'hard'
const empties = (b: Board) => b.flatMap((c, i) => (c ? [] : [i]))
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

function winningCell(b: Board, p: Player): number | null {
  for (const i of empties(b)) {
    const t = b.slice(); t[i] = p
    if (evaluate(t)) return i
  }
  return null
}

/** Minimax: +(10-depth) for AI win, (depth-10) for loss, 0 for draw. Depth term prefers faster wins. */
function minimax(b: Board, turn: Player, ai: Player, depth: number): number {
  const r = evaluate(b)
  if (r) return r.winner === ai ? 10 - depth : depth - 10
  const free = empties(b)
  if (!free.length) return 0
  const scores = free.map((i) => {
    b[i] = turn
    const s = minimax(b, other(turn), ai, depth + 1)
    b[i] = null
    return s
  })
  return turn === ai ? Math.max(...scores) : Math.min(...scores)
}

export function minimaxMove(board: Board, ai: Player): number {
  const b = board.slice()
  const scored = empties(b).map((i) => {
    b[i] = ai
    const s = minimax(b, other(ai), ai, 1)
    b[i] = null
    return { i, s }
  })
  const best = Math.max(...scored.map((x) => x.s))
  return pick(scored.filter((x) => x.s === best)).i
}

function mediumMove(b: Board, ai: Player): number {
  const free = empties(b)
  const win = winningCell(b, ai)
  if (win !== null) return win
  const block = winningCell(b, other(ai))
  if (block !== null) return block
  if (free.includes(4)) return 4
  const corners = free.filter((i) => [0, 2, 6, 8].includes(i))
  return corners.length ? pick(corners) : pick(free)
}

export function bestMove(board: Board, ai: Player, level: Level): number {
  if (!empties(board).length) throw new Error('No legal moves')
  if (level === 'easy') return pick(empties(board))
  return level === 'medium' ? mediumMove(board, ai) : minimaxMove(board, ai)
}
