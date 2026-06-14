# Build a Zoo

A playful Phaser 3 game for young kids. Animals arrive one by one, and players drag each animal into the habitat where it belongs: penguins to ice, lions to the savanna, fish to the aquarium, and more.

## Hidden benefit

Build a Zoo introduces categorization naturally through playful matching and immediate feedback.

## Commands

```bash
npm install
npm run dev
npm run build
npm run serve
```

## Structure

- [src/main.ts](src/main.ts): game bootstrap
- [src/game/config.ts](src/game/config.ts): Phaser game config
- [src/game/sfx.ts](src/game/sfx.ts): procedural audio helper
- [src/scenes/MenuScene.ts](src/scenes/MenuScene.ts): mode selection
- [src/scenes/GameScene.ts](src/scenes/GameScene.ts): core drag-and-drop categorization loop
- [src/scenes/CelebrationScene.ts](src/scenes/CelebrationScene.ts): end-of-game celebration
