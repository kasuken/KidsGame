import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode } from '../types';

const MODES: Array<{ mode: GameMode; title: string; subtitle: string; color: number }> = [
    { mode: 'all', title: 'ALL', subtitle: 'pop every balloon', color: 0xffd75e },
    { mode: 'red', title: 'RED', subtitle: 'only red balloons', color: 0xff5c8a },
    { mode: 'numbers', title: '123', subtitle: 'pop numbers', color: 0x48d7ff },
    { mode: 'letters', title: 'ABC', subtitle: 'pop letters', color: 0x55d982 }
];

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const { width, height } = this.scale;

        this.drawBackground();

        this.add
            .text(width / 2, 86, 'Balloon Pop', {
                fontFamily: '"Titan One", cursive',
                fontSize: '76px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 16,
                shadow: { offsetX: 6, offsetY: 6, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 150, 'Adventure', {
                fontFamily: '"Cherry Bomb One", cursive',
                fontSize: '62px',
                color: '#ffd75e',
                stroke: '#111111',
                strokeThickness: 13,
                shadow: { offsetX: 5, offsetY: 5, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 208, 'Choose a popping game', {
                fontFamily: '"Nunito", sans-serif',
                fontSize: '30px',
                fontWeight: '900',
                color: '#111111'
            })
            .setOrigin(0.5);

        const startX = width * 0.28;
        const startY = height * 0.58;
        const gapX = width * 0.44;
        const gapY = 142;

        MODES.forEach((modeInfo, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            this.createModeButton(startX + column * gapX, startY + row * gapY, 304, 112, modeInfo);
        });

        this.add
            .text(width / 2, height - 26, 'Infinite levels get a little busier each round', {
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

        this.add.rectangle(width / 2, height / 2, width, height, 0xbceeff);
        this.add.rectangle(width / 2, height - 45, width, 120, 0x55d982);
        this.add.rectangle(width / 2, height - 105, width, 12, 0x111111);

        const sun = this.add.circle(92, 84, 54, 0xffd75e, 1);
        sun.setStrokeStyle(8, 0x111111, 1);

        const clouds = this.add.graphics();
        clouds.fillStyle(0xffffff, 1);
        clouds.fillEllipse(width * 0.28, 92, 230, 76);
        clouds.fillEllipse(width * 0.74, 112, 250, 82);
        clouds.lineStyle(8, 0x111111);
        clouds.strokeEllipse(width * 0.28, 92, 230, 76);
        clouds.strokeEllipse(width * 0.74, 112, 250, 82);

        this.add.image(width * 0.12, 318, 'balloon-red').setScale(0.62).setAngle(-12);
        this.add.image(width * 0.88, 300, 'balloon-blue').setScale(0.58).setAngle(10);
    }

    private createModeButton(
        x: number,
        y: number,
        width: number,
        height: number,
        modeInfo: { mode: GameMode; title: string; subtitle: string; color: number }
    ): void {
        this.add.rectangle(x + 9, y + 9, width, height, 0x111111);
        const panel = this.add.rectangle(x, y, width, height, modeInfo.color).setStrokeStyle(8, 0x111111, 1);

        const titleText = this.add
            .text(x, y - 20, modeInfo.title, {
                fontFamily: '"Titan One", cursive',
                fontSize: '45px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 11
            })
            .setOrigin(0.5);

        const subtitleText = this.add
            .text(x, y + 32, modeInfo.subtitle, {
                fontFamily: '"Nunito", sans-serif',
                fontSize: '22px',
                fontWeight: '900',
                color: '#111111'
            })
            .setOrigin(0.5);

        const clickTarget = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });

        clickTarget.on('pointerover', () => {
            panel.x = x - 5;
            panel.y = y - 5;
            titleText.x = x - 5;
            titleText.y = y - 25;
            subtitleText.x = x - 5;
            subtitleText.y = y + 27;
        });

        clickTarget.on('pointerout', () => {
            panel.x = x;
            panel.y = y;
            titleText.x = x;
            titleText.y = y - 20;
            subtitleText.x = x;
            subtitleText.y = y + 32;
        });

        clickTarget.on('pointerdown', () => {
            Sfx.playPop(1.05);
            this.cameras.main.flash(160, 255, 255, 255);
            this.time.delayedCall(140, () => {
                this.scene.start('GameScene', { mode: modeInfo.mode });
            });
        });
    }
}
