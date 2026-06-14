# Balloon Pop Adventure

A playful Phaser 3 game for kids where colorful balloons float upward and pop with satisfying feedback.

## Fun-first goal

- Pop balloons with taps or clicks.
- Practice simple task switching with colors, numbers, and letters.
- Keep rounds endless, upbeat, and gently more challenging.

## Modes

- All Balloons:
  - Every balloon is a target.
  - Gentle entry mode for young players.

- Red Balloons:
  - Pop only red balloons.
  - Other colors are soft distractors.

- Numbers:
  - Pop balloons marked with numbers.
  - Letter balloons are distractors.

- Letters:
  - Pop balloons marked with letters.
  - Number balloons are distractors.

## Implemented MVP features

- Start screen with four large mode buttons
- Upward-floating generated balloon art
- Tap or click to pop balloons
- Burst particles and procedural pop sounds
- Infinite levels with rising target counts, faster pacing, and incremental scoring
- Soft mistakes only, with no hard fail state

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
- [src/scenes/CelebrationScene.ts](src/scenes/CelebrationScene.ts): celebration screen
- [src/types/index.ts](src/types/index.ts): shared mode and gameplay types

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

This project includes a deploy script using `gh-pages`.

1. Make sure your remote repository is set.
2. Run:

```bash
npm run deploy
```

This builds the game and publishes [dist](dist) to the `gh-pages` branch.

## Notes

- A large bundle warning is expected with Phaser in a single entry bundle.
- The current MVP uses generated art and procedural audio, so no external asset pack is required.
