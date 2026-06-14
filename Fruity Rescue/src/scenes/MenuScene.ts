import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode } from '../types';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const { width, height } = this.scale;
        const buttonY = height * 0.67;

        this.drawBackground();

        this.add
            .text(width / 2, 160, 'Fruit Rescue', {
                fontFamily: '"Titan One", cursive',
                fontSize: '76px',
                color: '#ffea00',
                stroke: '#111111',
                strokeThickness: 16,
                shadow: { offsetX: 6, offsetY: 6, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 208, 'Tap a mode to play', {
                fontFamily: '"Nunito", sans-serif',
                fontSize: '32px',
                fontWeight: '900',
                color: '#111111'
            })
            .setOrigin(0.5);

        this.createModeButton(width * 0.28, buttonY, 280, 170, 0xffd16b, 'BABY', 'slow and gentle', 'baby');
        this.createModeButton(width * 0.72, buttonY, 280, 170, 0x8bd67a, 'EXPLORER', 'faster with score', 'explorer');

        this.add
            .text(width / 2, height - 38, 'Best on touch and click screens', {
                fontFamily: '"Nunito", sans-serif',
                fontWeight: '900',
                fontSize: '22px',
                color: '#111111'
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => Sfx.unlock());
    }

    private drawBackground(): void {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x8b6aff);
        this.add.rectangle(width / 2, height - 36, width, 130, 0x00f0b5);
        this.add.rectangle(width / 2, height - 101, width, 12, 0x111111);

        const clouds = this.add.graphics();
        clouds.fillStyle(0xffffff, 1);
        clouds.fillEllipse(width * 0.25, 110, 220, 80);
        clouds.fillEllipse(width * 0.72, 85, 230, 84);

        const cloudsOutline = this.add.graphics();
        cloudsOutline.lineStyle(8, 0x111111);
        cloudsOutline.strokeEllipse(width * 0.25, 110, 220, 80);
        cloudsOutline.strokeEllipse(width * 0.72, 85, 230, 84);

        const fruit = this.add.graphics();
        fruit.lineStyle(6, 0x111111);
        fruit.fillStyle(0xff477e, 1);
        fruit.fillCircle(width * 0.14, 320, 26);
        fruit.strokeCircle(width * 0.14, 320, 26);

        fruit.fillStyle(0xffea00, 1);
        fruit.fillCircle(width * 0.84, 285, 24);
        fruit.strokeCircle(width * 0.84, 285, 24);

        fruit.fillStyle(0xff729f, 1);
        fruit.fillCircle(width * 0.8, 350, 22);
        fruit.strokeCircle(width * 0.8, 350, 22);
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
        this.add.rectangle(x + 10, y + 10, width, height, 0x111111);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x111111, 1);

        const titleText = this.add
            .text(x, y - 18, title, {
                fontFamily: '"Titan One", cursive',
                fontSize: '46px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 12
            })
            .setOrigin(0.5);

        const subtitleText = this.add
            .text(x, y + 38, subtitle, {
                fontFamily: '"Nunito", sans-serif',
                fontSize: '24px',
                fontWeight: '900',
                color: '#111111'
            })
            .setOrigin(0.5);

        const clickTarget = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });

        clickTarget.on('pointerover', () => {
            panel.x = x - 6;
            panel.y = y - 6;
            titleText.x = x - 6;
            titleText.y = y - 24;
            subtitleText.x = x - 6;
            subtitleText.y = y + 32;
        });

        clickTarget.on('pointerout', () => {
            panel.x = x;
            panel.y = y;
            titleText.x = x;
            titleText.y = y - 18;
            subtitleText.x = x;
            subtitleText.y = y + 38;
        });

        clickTarget.on('pointerdown', () => {
            Sfx.playPop(1.1);
            this.cameras.main.flash(180, 255, 255, 255);
            this.time.delayedCall(160, () => {
                this.scene.start('GameScene', { mode });
            });
        });
    }
}