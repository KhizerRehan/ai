# Kids Game Factory

Small browser games for young kids. One shared engine, one site, many games.

## Run

```
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). Pick a game tile.

## Layout

- `packages/core` — shared engine: fixed 16:9 canvas, game loop with auto-pause, mouse input, synthesized audio bus, scenes, HUD helpers, kid-sized buttons.
- `games/*` — one folder per game. Each exports a `GameDefinition`.
- `apps/site` — Vite site: game picker at `#/`, game at `#/play/<id>`.

## Add a game

1. Create `games/<id>` with a `package.json` like `games/duck-hunt/package.json` and a `src/index.ts` exporting a `GameDefinition`.
2. Add `"@kgf/<id>": "*"` to `apps/site/package.json` dependencies.
3. Add the export to the array in `apps/site/src/registry.ts`.
4. Run `npm install` once so the workspace link is created.

See `ai/docs/game-factory-architecture.md` for details.
