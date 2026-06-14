import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create(): void {
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'Opening the zoo gates...', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '54px',
                color: '#fff0a8',
                stroke: '#173329',
                strokeThickness: 12,
                shadow: { offsetX: 6, offsetY: 6, color: '#173329', fill: true }
            })
            .setOrigin(0.5);

        this.scene.start('MenuScene');
    }
}
