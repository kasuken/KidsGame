import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create(): void {
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'Opening the gates...', {
                fontFamily: '"Titan One", cursive',
                fontSize: '48px',
                color: '#ffffff',
                stroke: '#22322d',
                strokeThickness: 10,
                shadow: { offsetX: 6, offsetY: 6, color: '#22322d', fill: true }
            })
            .setOrigin(0.5);

        this.scene.start('MenuScene');
    }
}
