import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create(): void {
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'Snack time...', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '58px',
                color: '#ffd155',
                stroke: '#141414',
                strokeThickness: 12,
                shadow: { offsetX: 6, offsetY: 6, color: '#141414', fill: true }
            })
            .setOrigin(0.5);

        this.scene.start('MenuScene');
    }
}
