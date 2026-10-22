# Tic-Tac-Toe

React + TypeScript + Vite game with Player vs Player and Player vs Computer (Easy / Medium / Hard).

## Run
```bash
npm install
npm run dev      # development
npm test         # Vitest suite
npm run build    # type-check + production build
npm run preview
```
## AI
- **Easy**: random legal move. **Medium**: win if possible, else block, else centre, corner, any.
- **Hard**: full Minimax over the game tree. Scores are `10 - depth` for an AI win, `depth - 10` for a loss, `0` for a draw, so it wins fast and never loses (verified exhaustively in tests).

## Stats
Per mode, in localStorage. Win rate = X wins / total games (rounded). Streak = consecutive X wins.
Undo vs computer removes the AI reply plus your move (one move if your move ended the game).

## Structure
`src/game/engine.ts` (rules, undo), `ai.ts`, `stats.ts`, `game.test.ts`, `App.tsx` (UI).

## Deploy (GitHub Pages)
`vite.config.ts` uses `base: './'`. Run `npm run build` and publish `dist/` (e.g. with a Pages workflow or `gh-pages`).
```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main && git remote add origin https://github.com/<you>/<repo>.git && git push -u origin main
```
## Publish on GitHub Pages (important)
This is a Vite project: the root `index.html` points to `src/main.tsx`, which browsers cannot run. Pages must serve the **built** `dist/` folder.
1. Push the whole project (including the hidden `.github` folder) to `main`.
2. Repo **Settings > Pages > Build and deployment > Source: GitHub Actions** (not "Deploy from a branch").
3. Open the **Actions** tab, wait for "Deploy to GitHub Pages" to turn green, then open `https://<you>.github.io/<repo>/`.

## Screenshots
Run the app, take real screenshots, save to `docs/` and link them here.

## Not yet built
Ultimate mode, sound/haptics, accent colours, Framer Motion/Tailwind, component tests, online multiplayer.
