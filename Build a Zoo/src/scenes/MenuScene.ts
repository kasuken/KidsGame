import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode } from '../types';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const { width, height } = this.scale;
        const buttonY = height * 0.68;

        this.drawBackground();

        this.add
            .text(width / 2, 128, 'Build a Zoo', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '82px',
                color: '#fff0a8',
                stroke: '#173329',
                strokeThickness: 17,
                shadow: { offsetX: 7, offsetY: 7, color: '#173329', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 206, 'Match each animal to its perfect habitat', {
                fontFamily: '"Fredoka", "Titan One", sans-serif',
                fontSize: '31px',
                fontWeight: '700',
                color: '#173329',
                backgroundColor: 'rgba(255, 255, 255, 0.58)',
                padding: { x: 22, y: 8 }
            })
            .setOrigin(0.5);

        this.createModeButton(width * 0.28, buttonY, 292, 172, 0x7fe3ff, 'BABY', '3 animals, big hints', 'baby');
        this.createModeButton(width * 0.72, buttonY, 292, 172, 0xffb35f, 'EXPLORER', 'more habitats, score', 'explorer');

        this.add
            .text(width / 2, height - 38, 'Tap or drag the animal to its home', {
                fontFamily: '"Fredoka", sans-serif',
                fontWeight: '700',
                fontSize: '22px',
                color: '#173329'
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => Sfx.unlock());
    }

    private drawBackground(): void {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0xd8f6ff);
        this.add.rectangle(width / 2, height - 34, width, 132, 0x70d27b);
        this.add.rectangle(width / 2, height - 101, width, 12, 0x173329);

        const sun = this.add.graphics();
        sun.fillStyle(0xffd766, 1);
        sun.lineStyle(8, 0x173329, 1);
        sun.fillCircle(width - 92, 88, 52);
        sun.strokeCircle(width - 92, 88, 52);

        const clouds = this.add.graphics();
        clouds.fillStyle(0xffffff, 1);
        clouds.lineStyle(8, 0x173329, 1);
        clouds.fillEllipse(width * 0.2, 94, 218, 76);
        clouds.strokeEllipse(width * 0.2, 94, 218, 76);
        clouds.fillEllipse(width * 0.46, 76, 178, 62);
        clouds.strokeEllipse(width * 0.46, 76, 178, 62);

        this.add.text(width * 0.16, 292, '🐧', { fontSize: '58px' }).setOrigin(0.5).setAngle(-10);
        this.add.text(width * 0.82, 254, '🦁', { fontSize: '62px' }).setOrigin(0.5).setAngle(12);
        this.add.text(width * 0.88, 364, '🐟', { fontSize: '56px' }).setOrigin(0.5).setAngle(-8);
        this.add.text(width * 0.1, 394, '🌿', { fontSize: '60px' }).setOrigin(0.5).setAngle(14);
    }

    private createModeButton(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        title: string,
        subtitle: string,
        mode: GameMode
    ): void {
        this.add.rectangle(x + 10, y + 10, width, height, 0x173329);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x173329, 1);

        const titleText = this.add
            .text(x, y - 20, title, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '46px',
                color: '#ffffff',
                stroke: '#173329',
                strokeThickness: 12
            })
            .setOrigin(0.5);

        const subtitleText = this.add
            .text(x, y + 39, subtitle, {
                fontFamily: '"Fredoka", sans-serif',
                fontSize: '23px',
                fontWeight: '700',
                color: '#173329'
            })
            .setOrigin(0.5);

        const clickTarget = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });

        clickTarget.on('pointerover', () => {
            panel.setPosition(x - 6, y - 6);
            titleText.setPosition(x - 6, y - 26);
            subtitleText.setPosition(x - 6, y + 33);
        });

        clickTarget.on('pointerout', () => {
            panel.setPosition(x, y);
            titleText.setPosition(x, y - 20);
            subtitleText.setPosition(x, y + 39);
        });

        clickTarget.on('pointerdown', () => {
            Sfx.playPop(1.12);
            this.cameras.main.flash(180, 255, 255, 255);
            this.time.delayedCall(160, () => this.scene.start('GameScene', { mode }));
        });
    }
}
