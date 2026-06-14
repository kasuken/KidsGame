import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create(): void {
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'Warming the sunny sand...', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '54px',
                color: '#fff6bf',
                stroke: '#17445f',
                strokeThickness: 12,
                shadow: { offsetX: 6, offsetY: 6, color: '#17445f', fill: true }
            })
            .setOrigin(0.5);

        this.scene.start('MenuScene');
    }
}
