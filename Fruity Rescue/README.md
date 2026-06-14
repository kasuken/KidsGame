# Leo and Ludo Fruit Rescue (MVP)

A playful Phaser 3 game for short sessions on touch screens and desktop browsers.

## Fun-first goal

- Collect fruit by tapping or clicking falling objects.
- Fill the basket and celebrate after rescuing 10 fruits.
- Keep play gentle for younger kids and lightly challenging for older kids.

## Modes

- Baby mode (age ~2):
  - Larger objects
  - Slower spawn and fall speed
  - No bad objects
  - Missed fruit still helps progress, so it is very hard to get stuck

- Explorer mode (age ~6):
  - Faster spawn and fall speed
  - Score shown on screen
  - Includes one bad object type to avoid
  - Soft mistakes only (no hard fail)

## Implemented MVP features

- Start screen with two large mode buttons
- Falling fruit types: apple, banana, strawberry
- Tap or click to collect fruit
- Basket fill visualization tied to progress
- Celebration screen after 10 rescued fruits
- Procedural sound effects:
  - pop (fruit)
  - success jingle
  - soft mistake
- Works with generated art (no external image/audio pack required)

## Stack

- Phaser 3
- TypeScript
- Vite

## Project structure

- [src/main.ts](src/main.ts): game bootstrap
- [src/game/config.ts](src/game/config.ts): Phaser game config
- [src/game/sfx.ts](src/game/sfx.ts): procedural audio helper
- [src/scenes/BootScene.ts](src/scenes/BootScene.ts): startup handoff
- [src/scenes/PreloadScene.ts](src/scenes/PreloadScene.ts): generated textures
- [src/scenes/MenuScene.ts](src/scenes/MenuScene.ts): mode select screen
- [src/scenes/GameScene.ts](src/scenes/GameScene.ts): core gameplay loop
- [src/scenes/CelebrationScene.ts](src/scenes/CelebrationScene.ts): post-win screen
- [src/types/index.ts](src/types/index.ts): shared mode and summary types

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Build production bundle:

```bash
npm run build
```

4. Preview production build:

```bash
npm run serve
```

## Deploy to GitHub Pages

This repo includes a deploy script using `gh-pages`.

1. Make sure your remote repository is set.
2. Run:

```bash
npm run deploy
```

This builds the game and publishes [dist](dist) to the `gh-pages` branch.

## Notes

- A large bundle warning is expected with Phaser in a single entry bundle.
- The current MVP focuses on fun loop and responsiveness, not educational content.
