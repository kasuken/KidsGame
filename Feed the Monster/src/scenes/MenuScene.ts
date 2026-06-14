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
        this.drawMonster(width / 2, 322, 1.05, 0x7bd35f, 0xfff0a6, 0xff8d38);

        this.add
            .text(width / 2, 66, 'Feed the Monster', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '68px',
                color: '#ffd155',
                stroke: '#141414',
                strokeThickness: 14,
                shadow: { offsetX: 7, offsetY: 7, color: '#141414', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 142, 'Tap or drag snacks to the mouth', {
                fontFamily: '"Fredoka", sans-serif',
                fontSize: '29px',
                fontWeight: '700',
                color: '#141414'
            })
            .setOrigin(0.5);

        this.createModeButton(width * 0.28, buttonY, 282, 156, 0x8fdcff, 'BABY', 'gentle snack time', 'baby');
        this.createModeButton(width * 0.72, buttonY, 282, 156, 0xff4f8b, 'EXPLORER', 'faster with rocks', 'explorer');

        this.add
            .text(width / 2, height - 30, 'Feed favorite foods. Rocks are yucky.', {
                fontFamily: '"Fredoka", sans-serif',
                fontWeight: '700',
                fontSize: '22px',
                color: '#141414'
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => Sfx.unlock());
    }

    private drawBackground(): void {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0xfff7d7);
        this.add.rectangle(width / 2, height - 44, width, 124, 0x7bd35f);
        this.add.rectangle(width / 2, height - 108, width, 12, 0x141414);

        const shapes = this.add.graphics();
        shapes.fillStyle(0xffffff, 1);
        shapes.lineStyle(8, 0x141414, 1);
        shapes.fillEllipse(width * 0.18, 118, 184, 62);
        shapes.strokeEllipse(width * 0.18, 118, 184, 62);
        shapes.fillEllipse(width * 0.82, 114, 190, 64);
        shapes.strokeEllipse(width * 0.82, 114, 190, 64);

        shapes.fillStyle(0xffd155, 1);
        shapes.fillCircle(84, 264, 28);
        shapes.strokeCircle(84, 264, 28);
        shapes.fillStyle(0xff4f8b, 1);
        shapes.fillCircle(width - 86, 254, 26);
        shapes.strokeCircle(width - 86, 254, 26);
    }

    private drawMonster(x: number, y: number, scale: number, bodyColor: number, bellyColor: number, hornColor: number): void {
        const monster = this.add.graphics();
        monster.setScale(scale);
        monster.x = x;
        monster.y = y;

        monster.fillStyle(0x141414, 1);
        monster.fillEllipse(12, 96, 250, 44);
        monster.lineStyle(7, 0x141414, 1);
        monster.fillStyle(hornColor, 1);
        monster.fillTriangle(-76, -96, -42, -138, -28, -86);
        monster.strokeTriangle(-76, -96, -42, -138, -28, -86);
        monster.fillTriangle(34, -90, 68, -140, 82, -84);
        monster.strokeTriangle(34, -90, 68, -140, 82, -84);
        monster.fillStyle(bodyColor, 1);
        monster.fillEllipse(0, 0, 220, 210);
        monster.strokeEllipse(0, 0, 220, 210);
        monster.fillStyle(bellyColor, 1);
        monster.fillEllipse(0, 40, 128, 92);
        monster.strokeEllipse(0, 40, 128, 92);
        monster.fillStyle(0xffffff, 1);
        monster.fillCircle(-42, -42, 24);
        monster.fillCircle(42, -42, 24);
        monster.strokeCircle(-42, -42, 24);
        monster.strokeCircle(42, -42, 24);
        monster.fillStyle(0x141414, 1);
        monster.fillCircle(-34, -36, 8);
        monster.fillCircle(34, -36, 8);
        monster.fillRoundedRect(-52, 6, 104, 36, 18);
        monster.fillStyle(0xffffff, 1);
        monster.fillTriangle(-30, 8, -15, 8, -22, 22);
        monster.fillTriangle(16, 8, 32, 8, 24, 22);
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
        this.add.rectangle(x + 9, y + 9, width, height, 0x141414);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x141414, 1);
        const titleText = this.add
            .text(x, y - 18, title, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '42px',
                color: '#ffffff',
                stroke: '#141414',
                strokeThickness: 10
            })
            .setOrigin(0.5);
        const subtitleText = this.add
            .text(x, y + 35, subtitle, {
                fontFamily: '"Fredoka", sans-serif',
                fontSize: '23px',
                fontWeight: '700',
                color: '#141414'
            })
            .setOrigin(0.5);
        const clickTarget = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });

        clickTarget.on('pointerover', () => {
            panel.setPosition(x - 5, y - 5);
            titleText.setPosition(x - 5, y - 23);
            subtitleText.setPosition(x - 5, y + 30);
        });

        clickTarget.on('pointerout', () => {
            panel.setPosition(x, y);
            titleText.setPosition(x, y - 18);
            subtitleText.setPosition(x, y + 35);
        });

        clickTarget.on('pointerdown', () => {
            Sfx.playPop(1.08);
            this.cameras.main.flash(170, 255, 255, 255);
            this.time.delayedCall(150, () => this.scene.start('GameScene', { mode }));
        });
    }
}
