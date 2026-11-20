# Water Cannon

Soak the targets on the three rails before your tank runs dry.

## How to play

- Before each round, click **Easy** or **Hard** to pick a mode.
- Move the mouse to aim the cannon, and click to fire a shot of water.
- You have 15 shots. The game ends when the tank is empty and the last shot has landed.
- Click again on the game over screen to pick a mode for another round.

## Scoring

Each target scores 10 points for every 60 px/s of speed, rounded up:

| Rail   | Speed    | Points |
| ------ | -------- | ------ |
| Top    | 180 px/s | 30     |
| Middle | 120 px/s | 20     |
| Bottom | 60 px/s  | 10     |

## Modes

The two modes differ only in how fast the targets move. On **Easy** they move at
the speeds above. On **Hard** every target moves twice as fast, in the same
direction (360, 240 and 120 px/s), so each hit is worth more: 60, 40 and 20
points. The tank, shots and targets are the same size in both modes, and both
modes save to the same score board. The multipliers are `SPEED_MULTIPLIER` in
`game.ts`.

Your final score is saved to the carnival's score board when the game ends.

## Options

Add `?shots=25` to the page URL to change the size of the tank, for example
`http://localhost:5173/?shots=25#/play/water-cannon`.

## Files

- `game.ts`: the game logic (`createState`, `fire`, `step`, `scoreForHit`) and the
  `waterCannon` entry, the default export the midway finds.
- `game.test.ts`: tests for the game logic.
