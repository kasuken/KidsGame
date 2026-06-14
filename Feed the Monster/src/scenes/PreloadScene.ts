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

        this.createTextures();
        this.scene.start('MenuScene');
    }

    private createTextures(): void {
        if (this.textures.exists('food-apple')) {
            return;
        }

        const g = this.make.graphics({ x: 0, y: 0 });

        g.clear();
        g.lineStyle(6, 0x141414, 1);
        g.fillStyle(0xff4f8b, 1);
        g.fillCircle(30, 36, 22);
        g.fillCircle(42, 36, 19);
        g.strokeCircle(30, 36, 22);
        g.strokeCircle(42, 36, 19);
        g.fillStyle(0x7bd35f, 1);
        g.fillEllipse(47, 16, 20, 12);
        g.strokeEllipse(47, 16, 20, 12);
        g.fillStyle(0x6b3d24, 1);
        g.fillRect(33, 10, 8, 16);
        g.strokeRect(33, 10, 8, 16);
        g.generateTexture('food-apple', 72, 72);

        g.clear();
        g.lineStyle(7, 0x141414, 1);
        g.fillStyle(0xffd155, 1);
        g.fillEllipse(36, 38, 54, 28);
        g.strokeEllipse(36, 38, 54, 28);
        g.fillStyle(0xfff7d7, 1);
        g.fillEllipse(33, 29, 44, 20);
        g.fillStyle(0x141414, 1);
        g.fillCircle(12, 42, 4);
        g.fillCircle(61, 34, 4);
        g.generateTexture('food-banana', 72, 72);

        g.clear();
        g.lineStyle(6, 0x141414, 1);
        g.fillStyle(0x8fdcff, 1);
        g.fillRoundedRect(18, 28, 36, 30, 12);
        g.strokeRoundedRect(18, 28, 36, 30, 12);
        g.fillStyle(0xff4f8b, 1);
        g.fillEllipse(36, 28, 44, 20);
        g.strokeEllipse(36, 28, 44, 20);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(28, 22, 4);
        g.fillCircle(39, 20, 4);
        g.fillCircle(49, 24, 4);
        g.generateTexture('food-cupcake', 72, 72);

        g.clear();
        g.lineStyle(6, 0x141414, 1);
        g.fillStyle(0xff8d38, 1);
        g.fillTriangle(22, 20, 58, 34, 18, 58);
        g.strokeTriangle(22, 20, 58, 34, 18, 58);
        g.fillStyle(0x7bd35f, 1);
        g.fillEllipse(20, 18, 22, 12);
        g.strokeEllipse(20, 18, 22, 12);
        g.fillEllipse(28, 12, 20, 12);
        g.strokeEllipse(28, 12, 20, 12);
        g.generateTexture('food-carrot', 72, 72);

        g.clear();
        g.lineStyle(6, 0x141414, 1);
        g.fillStyle(0x8b8f9b, 1);
        g.beginPath();
        g.moveTo(18, 42);
        g.lineTo(24, 22);
        g.lineTo(46, 16);
        g.lineTo(59, 32);
        g.lineTo(54, 52);
        g.lineTo(31, 58);
        g.closePath();
        g.fillPath();
        g.strokePath();
        g.lineStyle(4, 0x5f6572, 1);
        g.lineBetween(30, 28, 42, 24);
        g.lineBetween(39, 42, 50, 37);
        g.generateTexture('food-rock', 72, 72);

        g.destroy();
    }
}
