import * as Phaser from 'phaser';
import BootScene from '../scenes/BootScene';
import CelebrationScene from '../scenes/CelebrationScene';
import GameScene from '../scenes/GameScene';
import MenuScene from '../scenes/MenuScene';
import PreloadScene from '../scenes/PreloadScene';

export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 960,
    height: 540,
    backgroundColor: '#97d6f4',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, CelebrationScene]
};