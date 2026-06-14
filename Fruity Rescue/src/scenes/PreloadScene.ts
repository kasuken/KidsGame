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
        if (this.textures.exists('bad-yuck')) {
            return;
        }

        const g = this.make.graphics({ x: 0, y: 0 });

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