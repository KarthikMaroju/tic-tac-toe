export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]
export interface GameState {
  board: Board
  current: Player
  winner: Player | null
  line: number[] | null
  draw: boolean
  history: number[]
}
export const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
export const other = (p: Player): Player => (p === 'X' ? 'O' : 'X')

export const newGame = (): GameState => ({
  board: Array<Cell>(9).fill(null), current: 'X', winner: null, line: null, draw: false, history: [],
})

export function evaluate(b: Board): { winner: Player; line: number[] } | null {
  for (const l of LINES) {
    const [a, c, d] = l
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a] as Player, line: l }
  }
  return null
}

/** Applies a move. Invalid moves (occupied, out of range, game over) return the same state object. */
export function move(s: GameState, i: number): GameState {
  if (s.winner || s.draw || !Number.isInteger(i) || i < 0 || i > 8 || s.board[i]) return s
  const board = s.board.slice()
  board[i] = s.current
  const r = evaluate(board)
  return {
    board, history: [...s.history, i],
    current: r ? s.current : other(s.current),
    winner: r ? r.winner : null, line: r ? r.line : null,
    draw: !r && board.every(Boolean),
  }
}

/** Undo by replaying history minus the last n moves, so every field is restored consistently. */
export function undo(s: GameState, n = 1): GameState {
  return s.history.slice(0, Math.max(0, s.history.length - n)).reduce(move, newGame())
}
