import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameSummary } from '../types';

export default class CelebrationScene extends Phaser.Scene {
    private summary: GameSummary = {
        mode: 'baby',
        animalsPlaced: 5,
        score: 0
    };

    constructor() {
        super({ key: 'CelebrationScene' });
    }

    init(data: Partial<GameSummary>): void {
        this.summary = {
            mode: data.mode === 'explorer' ? 'explorer' : 'baby',
            animalsPlaced: data.animalsPlaced ?? 5,
            score: data.score ?? 0
        };
    }

    create(): void {
        const { width, height } = this.scale;
        this.drawBackground();
        this.startConfetti();
        Sfx.playSuccess();

        this.add
            .text(width / 2, 86, 'Zoo Complete!', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '82px',
                color: '#fff0a8',
                stroke: '#173329',
                strokeThickness: 18,
                shadow: { offsetX: 7, offsetY: 7, color: '#173329', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 178, `${this.summary.animalsPlaced} animals found happy homes`, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '38px',
                color: '#ffffff',
                stroke: '#173329',
                strokeThickness: 10
            })
            .setOrigin(0.5);

        if (this.summary.mode === 'explorer') {
            this.add
                .text(width / 2, 230, `score ${this.summary.score}`, {
                    fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                    fontSize: '36px',
                    color: '#ffdf7e',
                    stroke: '#173329',
                    strokeThickness: 9
                })
                .setOrigin(0.5);
        }

        this.drawZooParade(width / 2, 320);
        this.createButton(width / 2, height - 110, 330, 76, 0xff7f7f, 'Play Again', () => {
            this.scene.start('GameScene', { mode: this.summary.mode });
        });
        this.createButton(width / 2, height - 30, 330, 66, 0x7fe3ff, 'Modes', () => this.scene.start('MenuScene'));
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0xd8f6ff);
        this.add.rectangle(width / 2, height - 42, width, 126, 0x70d27b);
        this.add.rectangle(width / 2, height - 106, width, 12, 0x173329);

        const clouds = this.add.graphics();
        clouds.lineStyle(8, 0x173329, 1);
        clouds.fillStyle(0xffffff, 1);
        clouds.fillEllipse(width * 0.18, 104, 220, 78);
        clouds.strokeEllipse(width * 0.18, 104, 220, 78);
        clouds.fillEllipse(width * 0.82, 92, 220, 74);
        clouds.strokeEllipse(width * 0.82, 92, 220, 74);
    }

    private drawZooParade(x: number, y: number): void {
        const shelf = this.add.graphics();
        shelf.fillStyle(0x173329, 1);
        shelf.fillRoundedRect(x - 280 + 8, y + 52 + 8, 560, 34, 14);
        shelf.fillStyle(0xffffff, 1);
        shelf.lineStyle(6, 0x173329, 1);
        shelf.fillRoundedRect(x - 280, y + 52, 560, 34, 14);
        shelf.strokeRoundedRect(x - 280, y + 52, 560, 34, 14);

        ['��', '🦁', '🐟', '🐒', '🐪'].forEach((emoji, index) => {
            const animal = this.add.text(x - 206 + index * 104, y, emoji, { fontSize: '58px' }).setOrigin(0.5);
            this.tweens.add({
                targets: animal,
                y: y - 12,
                duration: 520 + index * 80,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut'
            });
        });
    }

    private startConfetti(): void {
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => this.spawnConfettiPiece()
        });
    }

    private spawnConfettiPiece(): void {
        const colors = [0xffdf7e, 0xff7f7f, 0x70d27b, 0x7fe3ff, 0xffffff];
        const x = Phaser.Math.Between(16, this.scale.width - 16);
        const piece = this.add.rectangle(x, -12, 12, 16, Phaser.Utils.Array.GetRandom(colors));
        piece.setAngle(Phaser.Math.Between(0, 45));

        this.tweens.add({
            targets: piece,
            y: this.scale.height + 20,
            x: x + Phaser.Math.Between(-46, 46),
            angle: piece.angle + Phaser.Math.Between(220, 540),
            duration: Phaser.Math.Between(1350, 2200),
            ease: 'Sine.In',
            onComplete: () => piece.destroy()
        });
    }

    private createButton(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        label: string,
        onClick: () => void
    ): void {
        this.add.rectangle(x + 8, y + 8, width, height, 0x173329);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x173329, 1);
        const text = this.add
            .text(x, y, label, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: height > 70 ? '38px' : '34px',
                color: '#ffffff',
                stroke: '#173329',
                strokeThickness: 9
            })
            .setOrigin(0.5);
        const clickTarget = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });

        clickTarget.on('pointerover', () => {
            panel.setPosition(x - 4, y - 4);
            text.setPosition(x - 4, y - 4);
        });
        clickTarget.on('pointerout', () => {
            panel.setPosition(x, y);
            text.setPosition(x, y);
        });
        clickTarget.on('pointerdown', () => {
            Sfx.playPop(1.1);
            onClick();
        });
    }
}
