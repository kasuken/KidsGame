import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode } from '../types';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const { width, height } = this.scale;
        this.drawBackground();

        this.add
            .text(width / 2, 108, 'Treasure Beach', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '82px',
                color: '#fff6bf',
                stroke: '#17445f',
                strokeThickness: 17,
                shadow: { offsetX: 7, offsetY: 7, color: '#17445f', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 190, 'Tap the sand piles and collect every surprise', {
                fontFamily: '"Fredoka", "Titan One", sans-serif',
                fontSize: '30px',
                fontWeight: '700',
                color: '#17445f',
                backgroundColor: 'rgba(255, 246, 191, 0.74)',
                padding: { x: 24, y: 9 }
            })
            .setOrigin(0.5);

        this.createModeButton(width * 0.28, height * 0.68, 292, 172, 0xffcf67, 'TINY DIG', '8 piles, all rewards', 'baby');
        this.createModeButton(width * 0.72, height * 0.68, 292, 172, 0xff8c4b, 'BIG DIG', '12 piles, bonus score', 'explorer');

        this.add
            .text(width / 2, height - 38, 'Find shells, coins, pirates, and crabs', {
                fontFamily: '"Fredoka", sans-serif',
                fontWeight: '700',
                fontSize: '22px',
                color: '#17445f'
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => Sfx.unlock());
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x73d9ff);
        this.add.rectangle(width / 2, height - 66, width, 210, 0xffcf67);
        this.add.rectangle(width / 2, height - 176, width, 28, 0xffffff, 0.86);
        this.add.rectangle(width / 2, height - 202, width, 54, 0x2aa7cf, 0.8);

        const sun = this.add.graphics();
        sun.fillStyle(0xff8c4b, 1);
        sun.lineStyle(8, 0x17445f, 1);
        sun.fillCircle(width - 96, 86, 52);
        sun.strokeCircle(width - 96, 86, 52);

        const waves = this.add.graphics();
        waves.lineStyle(7, 0x17445f, 1);
        for (let x = -40; x < width + 60; x += 128) {
            waves.beginPath();
            waves.arc(x, height - 202, 52, 0, Math.PI, false);
            waves.strokePath();
        }

        ['🐚', '🪙', '🏴‍☠️', '🦀'].forEach((emoji, index) => {
            this.add
                .text(124 + index * 228, 282 + (index % 2) * 46, emoji, { fontSize: '58px' })
                .setOrigin(0.5)
                .setAngle(index % 2 === 0 ? -10 : 10);
        });
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
        this.add.rectangle(x + 10, y + 10, width, height, 0x17445f);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x17445f, 1);
        const titleText = this.add
            .text(x, y - 20, title, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '43px',
                color: '#ffffff',
                stroke: '#17445f',
                strokeThickness: 11
            })
            .setOrigin(0.5);
        const subtitleText = this.add
            .text(x, y + 39, subtitle, {
                fontFamily: '"Fredoka", sans-serif',
                fontSize: '23px',
                fontWeight: '700',
                color: '#17445f'
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
            this.cameras.main.flash(180, 255, 246, 191);
            this.time.delayedCall(160, () => this.scene.start('GameScene', { mode }));
        });
    }
}
