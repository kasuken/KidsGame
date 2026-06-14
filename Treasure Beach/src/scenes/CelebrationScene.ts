import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameSummary } from '../types';

export default class CelebrationScene extends Phaser.Scene {
    private summary: GameSummary = {
        mode: 'baby',
        treasuresFound: 8,
        score: 0
    };

    constructor() {
        super({ key: 'CelebrationScene' });
    }

    init(data: Partial<GameSummary>): void {
        this.summary = {
            mode: data.mode === 'explorer' ? 'explorer' : 'baby',
            treasuresFound: data.treasuresFound ?? 8,
            score: data.score ?? 0
        };
    }

    create(): void {
        const { width, height } = this.scale;
        this.drawBackground();
        this.startConfetti();
        Sfx.playSuccess();

        this.add
            .text(width / 2, 84, 'Treasure Found!', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '80px',
                color: '#fff6bf',
                stroke: '#17445f',
                strokeThickness: 18,
                shadow: { offsetX: 7, offsetY: 7, color: '#17445f', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 174, `${this.summary.treasuresFound} sandy surprises collected`, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '36px',
                color: '#ffffff',
                stroke: '#17445f',
                strokeThickness: 10
            })
            .setOrigin(0.5);

        if (this.summary.mode === 'explorer') {
            this.add
                .text(width / 2, 224, `score ${this.summary.score}`, {
                    fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                    fontSize: '34px',
                    color: '#fff6bf',
                    stroke: '#17445f',
                    strokeThickness: 9
                })
                .setOrigin(0.5);
        }

        this.drawTreasureChest(width / 2, 326);
        this.createButton(width / 2, height - 110, 330, 76, 0xff8c4b, 'Dig Again', () => {
            this.scene.start('GameScene', { mode: this.summary.mode });
        });
        this.createButton(width / 2, height - 30, 330, 66, 0xffcf67, 'Modes', () => this.scene.start('MenuScene'));
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x73d9ff);
        this.add.rectangle(width / 2, height - 62, width, 212, 0xffcf67);
        this.add.rectangle(width / 2, height - 176, width, 36, 0xffffff, 0.85);
        this.add.rectangle(width / 2, height - 206, width, 62, 0x2aa7cf, 0.82);

        const g = this.add.graphics();
        g.lineStyle(8, 0x17445f, 1);
        g.fillStyle(0xffffff, 1);
        g.fillEllipse(width * 0.18, 104, 220, 78);
        g.strokeEllipse(width * 0.18, 104, 220, 78);
        g.fillEllipse(width * 0.82, 92, 220, 74);
        g.strokeEllipse(width * 0.82, 92, 220, 74);
    }

    private drawTreasureChest(x: number, y: number): void {
        const chest = this.add.graphics();
        chest.fillStyle(0x17445f, 1);
        chest.fillRoundedRect(x - 156 + 10, y - 52 + 10, 312, 124, 18);
        chest.fillStyle(0x8b4a28, 1);
        chest.lineStyle(8, 0x17445f, 1);
        chest.fillRoundedRect(x - 156, y - 52, 312, 124, 18);
        chest.strokeRoundedRect(x - 156, y - 52, 312, 124, 18);
        chest.fillStyle(0xf7b14d, 1);
        chest.fillRoundedRect(x - 156, y - 86, 312, 68, 28);
        chest.strokeRoundedRect(x - 156, y - 86, 312, 68, 28);
        chest.fillStyle(0xffdf55, 1);
        chest.fillRoundedRect(x - 22, y - 28, 44, 50, 8);
        chest.strokeRoundedRect(x - 22, y - 28, 44, 50, 8);

        ['🐚', '🪙', '🏴‍☠️', '🦀'].forEach((emoji, index) => {
            const prize = this.add.text(x - 114 + index * 76, y - 118, emoji, { fontSize: '52px' }).setOrigin(0.5);
            this.tweens.add({
                targets: prize,
                y: y - 134,
                duration: 520 + index * 80,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut'
            });
        });
    }

    private startConfetti(): void {
        this.time.addEvent({
            delay: 95,
            loop: true,
            callback: () => this.spawnConfettiPiece()
        });
    }

    private spawnConfettiPiece(): void {
        const pieces = ['✨', '🐚', '🪙'];
        const x = Phaser.Math.Between(16, this.scale.width - 16);
        const piece = this.add.text(x, -16, Phaser.Utils.Array.GetRandom(pieces), { fontSize: '24px' }).setOrigin(0.5);
        piece.setAngle(Phaser.Math.Between(0, 45));

        this.tweens.add({
            targets: piece,
            y: this.scale.height + 24,
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
        this.add.rectangle(x + 8, y + 8, width, height, 0x17445f);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x17445f, 1);
        const text = this.add
            .text(x, y, label, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: height > 70 ? '38px' : '34px',
                color: '#ffffff',
                stroke: '#17445f',
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
