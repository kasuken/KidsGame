import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create(): void {
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'Inflating...', {
                fontFamily: '"Titan One", cursive',
                fontSize: '54px',
                color: '#ffd75e',
                stroke: '#111111',
                strokeThickness: 10,
                shadow: { offsetX: 6, offsetY: 6, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.createTextures();
        this.scene.start('MenuScene');
    }

    private createTextures(): void {
        if (this.textures.exists('balloon-red')) {
            return;
        }

        this.createBalloonTexture('balloon-red', 0xff5c8a, 0xff9bb6);
        this.createBalloonTexture('balloon-yellow', 0xffd75e, 0xffee9a);
        this.createBalloonTexture('balloon-blue', 0x48d7ff, 0xa4ecff);
        this.createBalloonTexture('balloon-green', 0x55d982, 0x9ef0b8);
    }

    private createBalloonTexture(key: string, fill: number, highlight: number): void {
        const g = this.make.graphics({ x: 0, y: 0 });

        g.lineStyle(7, 0x111111, 1);
        g.fillStyle(fill, 1);
        g.fillEllipse(46, 40, 70, 78);
        g.strokeEllipse(46, 40, 70, 78);

        g.fillStyle(highlight, 0.9);
        g.fillEllipse(34, 26, 19, 25);

        g.fillStyle(fill, 1);
        g.lineStyle(6, 0x111111, 1);
        g.fillTriangle(38, 78, 54, 78, 46, 94);
        g.strokeTriangle(38, 78, 54, 78, 46, 94);

        g.lineStyle(4, 0x111111, 1);
        g.beginPath();
        g.moveTo(46, 94);
        g.lineTo(41, 110);
        g.lineTo(49, 124);
        g.lineTo(44, 140);
        g.strokePath();

        g.generateTexture(key, 92, 146);
        g.destroy();
    }
}
