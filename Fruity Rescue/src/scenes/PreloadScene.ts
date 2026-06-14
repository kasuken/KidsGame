import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create() {
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'Loading...', {
                fontFamily: '"Titan One", cursive',
                fontSize: '54px',
                color: '#ffea00',
                stroke: '#111111',
                strokeThickness: 10,
                shadow: { offsetX: 6, offsetY: 6, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.createTextures();
        this.scene.start('MenuScene');
    }

    private createTextures(): void {
        if (this.textures.exists('fruit-apple')) {
            return;
        }

        const g = this.make.graphics({ x: 0, y: 0 });

        g.clear();
        // Apple
        g.lineStyle(6, 0x111111);
        g.fillStyle(0xff477e, 1);
        g.fillCircle(32, 34, 22);
        g.strokeCircle(32, 34, 22);
        
        g.fillStyle(0x00f0b5, 1);
        g.fillRect(30, 8, 8, 14);
        g.strokeRect(30, 8, 8, 14);
        g.fillEllipse(44, 16, 16, 10);
        g.strokeEllipse(44, 16, 16, 10);
        g.generateTexture('fruit-apple', 64, 64);

        g.clear();
        // Banana
        g.lineStyle(6, 0x111111);
        g.fillStyle(0xffea00, 1);
        g.fillEllipse(30, 34, 34, 18);
        g.strokeEllipse(30, 34, 34, 18);
        
        g.fillStyle(0x111111, 1);
        g.fillCircle(12, 38, 4);
        g.generateTexture('fruit-banana', 64, 64);

        g.clear();
        // Strawberry
        g.lineStyle(6, 0x111111);
        g.fillStyle(0xff477e, 1);
        g.fillTriangle(32, 14, 12, 50, 52, 50);
        g.strokeTriangle(32, 14, 12, 50, 52, 50);
        g.fillCircle(32, 24, 13);
        g.strokeCircle(32, 24, 13);
        
        g.fillStyle(0x00f0b5, 1);
        g.fillTriangle(32, 9, 22, 20, 42, 20);
        g.strokeTriangle(32, 9, 22, 20, 42, 20);
        
        g.fillStyle(0x111111, 1);
        g.fillCircle(22, 34, 3);
        g.fillCircle(32, 32, 3);
        g.fillCircle(41, 37, 3);
        g.fillCircle(28, 42, 3);
        g.fillCircle(37, 45, 3);
        g.generateTexture('fruit-strawberry', 64, 64);

        g.clear();
        // Bad Yuck
        g.lineStyle(6, 0x111111);
        g.fillStyle(0x8b6aff, 1);
        g.fillCircle(32, 32, 23);
        g.strokeCircle(32, 32, 23);
        
        g.fillCircle(20, 27, 9);
        g.strokeCircle(20, 27, 9);
        g.fillCircle(45, 28, 9);
        g.strokeCircle(45, 28, 9);
        
        g.lineStyle(6, 0x111111, 1);
        g.lineBetween(18, 22, 24, 28);
        g.lineBetween(24, 22, 18, 28);
        g.lineBetween(40, 22, 46, 28);
        g.lineBetween(46, 22, 40, 28);
        
        g.fillStyle(0x111111, 1);
        g.fillEllipse(32, 44, 16, 8);
        g.generateTexture('bad-yuck', 64, 64);

        g.destroy();
    }
}