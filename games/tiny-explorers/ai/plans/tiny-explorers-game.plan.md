# Tiny Explorers — single-file kids learning game

## Context

The folder `~/Work/ai/games/untitled folder` is empty. The user pasted a full product spec for a self-contained HTML5 educational game for ages 3–7 (four categories, TTS, Web Audio SFX, confetti, sticker book, parent dashboard with math gate and screen-time lock) and asked for two things:

1. Rename the folder to something meaningful. Decided: `tiny-explorers` (kebab-case, matches sibling `shooting-bird`). Game title: "Tiny Explorers".
2. Deliver the complete game as one production-ready file with zero external media. Decided: persist stickers and parent settings in `localStorage`.

Outcome: `~/Work/ai/games/tiny-explorers/index.html` opens in any modern browser from disk and is fully playable with no build step.

## Deliverables

| Path | Purpose |
|---|---|
| `~/Work/ai/games/tiny-explorers/` | renamed project folder (`mv "untitled folder" tiny-explorers`) |
| `tiny-explorers/index.html` | entire game: HTML + Tailwind CDN + inline CSS + inline JS |
| `tiny-explorers/README.md` | short: how to open, controls, parent gate |
| `tiny-explorers/ai/plans/…` | this plan moves with the folder |

Single file only. No `.png/.jpg/.mp3`, no bundler. Only network dependencies: Tailwind CDN script and Google Fonts (Fredoka + Nunito) link, both with graceful fallback (`font-family` stack falls back to system rounded sans; layout uses inline CSS for critical sizing so it works if Tailwind fails to load).

## Architecture (inside `index.html`)

Invoke `frontend-design` skill before writing markup — playful, high-contrast, non-generic palette (warm cream background, chunky rounded cards, thick outlines, big drop shadows).

### Screens (one `<section>` each, toggled by `showScreen(id)`)

1. **Home** — title, 4 giant category buttons (Animals / Colors / Fruits / Shapes, each with inline SVG icon + sticker badge if earned), Sticker Book button, settings cog (bottom-right, small on purpose).
2. **Play** — question banner with "Repeat Voice" speaker button, 2×2 grid of answer cards (min 160px tall, 64px+ hit target), progress dots (5), score stars, Home button.
3. **Victory** — stars earned (1–3 based on wrong attempts), sticker reveal with pop animation, confetti, "Play Again" + "More Games".
4. **Sticker Book** — 4 slots, earned ones show full SVG sticker, unearned show dashed grey silhouette with lock.
5. **Parent Gate** — modal: "Grown-ups only: What is A + B?" with A,B random 1–9, numeric input, big keypad. Wrong answer regenerates puzzle.
6. **Parent Dashboard** — voice speed (Slow / Normal / Fast → SpeechSynthesis `rate` 0.7 / 1.0 / 1.3), Clear Stickers button (with confirm), Screen Time Limit (Off / 5 / 10 / 20 min), session elapsed display, Back.
7. **Locked** — full-screen overlay "Time for a break!" with sleeping moon SVG; only exit is the parent gate → dashboard → "Unlock" (resets timer).

### Content data (`CATEGORIES` const)

Each category: `{ id, title, color, sticker: svgId, questions: [ { prompt, answer, choices:[4 ids] } ×5 ] }`.

- **Animals**: lion, bear, duck, monkey, elephant, frog, cat, pig — 5 prompts ("Find the roaring Lion!", "Where is the hopping Frog?", …)
- **Colors**: red, blue, yellow, green, orange, purple, pink — rendered as paint splash SVG with gradient
- **Fruits**: apple, banana, strawberry, grape, orange, watermelon, pear — 5 prompts
- **Shapes**: `{shape, color}` combos — red circle, blue triangle, green square, yellow star, purple heart, orange hexagon — 5 prompts ("Click on the Blue Triangle!")

Every choice renders through `renderIcon(categoryId, choiceId)` returning an inline SVG string. All SVGs hand-authored (~40 total), kept simple: flat shapes, 2–4 paths each, `viewBox="0 0 100 100"`. Choices shuffled per turn; correct answer always among 4.

### Audio (`Sfx` module, Web Audio API)

- Lazy `AudioContext` created on first user gesture (iOS/Chrome autoplay policy); `resume()` on every tap.
- `correct()`: C5–E5–G5 major chord, square + triangle oscillators, 180ms, exponential gain decay.
- `wrong()`: single sine 220→140Hz pitch bend over 250ms ("bloop").
- `fanfare()`: ascending arpeggio C–E–G–C6 + sustained chord, ~900ms.
- `tap()`: 30ms click for buttons.
- No audio files anywhere.

### Voice (`Voice` module, SpeechSynthesis)

- `speak(text)`: cancels pending, picks an `en` voice (prefers names containing "Samantha", "Google US English", else first `en-*`), applies `rate` from settings, `pitch` 1.1.
- Auto-speak on new question (after 300ms so card animation lands), on victory, and on category select ("Let's find animals!").
- "Repeat Voice" button always visible on Play screen; pulses while speaking (`onstart`/`onend`).
- If `speechSynthesis` missing: button hidden, game still works (text prompts large).

### Game engine (`Game` module)

State: `{ screen, categoryId, qIndex, wrongThisQ, wrongTotal, locked:Set<choiceId>, answeredIds }`.

Flow per question: render → speak → tap card →
- correct: card gets `.is-correct` (green flash + scale pop), `Sfx.correct()`, `Confetti.burst(x,y)`, lock grid, 900ms → next question or victory.
- wrong: card gets `.is-wrong` (shake keyframes 400ms), `Sfx.wrong()`, card dimmed + `aria-disabled`, `wrongThisQ++`, child retries. Question re-spoken after 2 wrong taps.

Stars: 0 wrong total → 3★, ≤2 → 2★, else 1★. Sticker unlocks on any completion (kid-friendly, no fail state).

### Confetti (`Confetti` module)

Full-screen `<canvas>` behind UI with `pointer-events:none`. `burst(x,y,count)` spawns particles (rect + circle + star shapes, 6 palette colors, gravity, drag, spin). `requestAnimationFrame` loop runs only while particles alive. Victory calls 3 bursts across top of screen.

### Persistence (`Store` module)

`localStorage` key `tiny-explorers:v1` → `{ stickers: string[], voiceRate: 'slow'|'normal'|'fast', timeLimitMin: 0|5|10|20 }`. Try/catch around all reads/writes (private mode). In-memory fallback object if storage throws.

### Screen-time (`Timer` module)

Starts on first category tap, `setInterval` 1s, compares `Date.now() - startedAt` to limit. On expiry: `Voice.speak("Time for a break!")`, show Locked screen, cancel in-flight game. Dashboard shows "Played: 7 min". Changing limit in dashboard resets start. Timer survives screen changes but not reload (intentional — reload = new session).

### Parent gate

`openGate(onSuccess)`: generates `a,b ∈ [1,9]`, sum shown as text puzzle; on-screen keypad (0–9, ⌫, ✓) because children's devices often have no keyboard focus. Correct → `onSuccess()`; wrong → shake + new numbers. Three wrong in a row → 10s cooldown message.

### Accessibility

- All cards are `<button>` with `aria-label` ("Lion"), `role` default.
- Min target 128×128px cards on mobile, 180px desktop; nav buttons ≥ 72px.
- `prefers-reduced-motion`: shake → opacity dip, confetti count halved, no scale pop.
- Focus rings visible (thick yellow outline). Keyboard: Enter/Space on cards, Escape closes modals.
- Font sizes: prompt 2rem+, buttons 1.5rem+, Fredoka for headings, Nunito for body.

### Layout / responsive

Mobile-first. Grid: `grid-cols-2` always (4 choices); on landscape phones height-capped cards with `aspect-ratio: 1`. `100dvh` containers, no page scroll on Play screen. Tested widths: 375, 768, 1280.

## Implementation steps

1. `mv "/Users/khizerrehandev/Work/ai/games/untitled folder" /Users/khizerrehandev/Work/ai/games/tiny-explorers` (plan file moves with it). Note: the Claude session's working directory may still point at the old path; `ccd_directory` tool or reopen session if needed.
2. Invoke `frontend-design` skill; settle palette + type scale.
3. Write `index.html` in order: `<head>` (Tailwind CDN, fonts, inline CSS with keyframes `shake`, `pop`, `pulse`, `float`, `wiggle`, reduced-motion block) → 7 screen sections → `<canvas id="confetti">` → `<script>` with modules in dependency order: `Store`, `Sfx`, `Voice`, `Confetti`, `Icons` (SVG library), `CATEGORIES`, `Timer`, `Gate`, `Game`, `UI`, `init()`.
4. Write `README.md` (open file, how parent gate works, where data lives).
5. Verification pass (below).

Size estimate: ~1,400–1,800 lines, ~70 KB. Fine for single file.

## Verification

Per CLAUDE.md: no build/lint/test commands. Verify manually in built-in browser pane:

1. `preview_start` with `file:///Users/khizerrehandev/Work/ai/games/tiny-explorers/index.html` (or `python3 -m http.server` if `file://` blocks fonts).
2. Home renders 4 category buttons, cog, sticker book; console has zero errors.
3. Play Animals: question spoken (check `speechSynthesis.speaking` via `javascript_tool`), tap wrong card → shake + dim + stays interactive elsewhere; tap right → green + confetti particles on canvas + advance; 5 questions → Victory with stars + sticker.
4. Sticker Book shows Animals sticker; reload page → still there (localStorage).
5. Cog → gate: wrong answer regenerates; right answer opens dashboard. Set Screen Time 5 min; use `javascript_tool` to fast-forward `Timer.startedAt -= 5*60*1000` → Locked screen appears; gate unlocks.
6. Voice speed Fast → `Voice.rate === 1.3` and next prompt audibly faster.
7. Clear Stickers → Sticker Book empty, Home badges gone.
8. `resize_window` mobile preset (375×812): no horizontal scroll, cards ≥128px, all text legible. Repeat with `tablet`.
9. Screenshot each screen; eyeball Tailwind + fonts loaded.
10. Offline sanity: block network (`javascript_tool` cannot; instead temporarily remove CDN link in a scratchpad copy) → layout still usable thanks to inline critical CSS.

## Out of scope

- Multiple languages, user profiles, server sync, analytics.
- Service worker / PWA manifest (would require extra files; user asked single file).
