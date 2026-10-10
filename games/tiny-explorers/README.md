# Tiny Explorers

A single-file learning game for children aged 3 to 7. Four adventures: Animals, Colors, Fruits and Shapes. Each round picks six spoken questions from the category's pool (Animals has sixteen creatures), rewards correct taps with confetti and chimes, and unlocks a sticker on completion.

## Run it

Open `index.html` in any modern browser. No build step, no install.

Tailwind and the Fredoka/Nunito fonts load from a CDN when online. Offline, the layout still works because all critical styles are inline and the font stack falls back to a rounded system font. Every picture is an inline SVG and every sound is generated with the Web Audio API, so there are no image or audio files.

For local testing with a server:

```bash
python3 -m http.server 4173
```

then visit `http://127.0.0.1:4173/`.

## How to play

1. Tap a category on the home screen.
2. The helper voice reads the question aloud. Tap the speaker button to hear it again.
3. Tap the matching picture. Wrong picks shake, dim and let the child try again. Right picks flash green, burst confetti and move on.
4. After the last question the victory screen shows 1 to 3 stars and reveals the category sticker.
5. "My Sticker Book" on the home screen shows every sticker earned so far.

Stars: 3 for no mistakes, 2 for one or two mistakes, 1 otherwise.

## Grown-ups area

The cog in the bottom-right corner opens a math gate ("What is 4 + 3?") with an on-screen keypad. Three wrong answers in a row add a 10 second cooldown. Inside the dashboard:

- **Voice speed**: Slow, Normal or Fast, with a test button.
- **Screen time limit**: Off, 5, 10 or 20 minutes. The clock starts when the child begins a category. When time is up the game shows a "Time for a break" screen that only the gate can unlock. Changing the limit restarts the clock.
- **Clear all stickers**: two taps to confirm.

## Data

Stickers and settings are saved in the browser under the `localStorage` key `tiny-explorers:v1`. The screen-time clock is per session and resets on reload. Private browsing or blocked storage falls back to in-memory state for the session.

## Accessibility

- Every answer is a real button with an `aria-label`, so screen readers and keyboards work.
- Minimum tap target is 128 px for answer cards and 72 px for navigation buttons.
- Visible focus rings, Escape closes the gate, Enter submits the keypad.
- `prefers-reduced-motion` disables shakes, pops and halves the confetti.
