import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameSummary } from '../types';

export default class CelebrationScene extends Phaser.Scene {
    private summary: GameSummary = {
        mode: 'baby',
        collected: 10,
        score: 0
    };

    constructor() {
        super({ key: 'CelebrationScene' });
    }

    init(data: Partial<GameSummary>): void {
        this.summary = {
            mode: data.mode === 'explorer' ? 'explorer' : 'baby',
            collected: data.collected ?? 10,
            score: data.score ?? 0
        };
    }

    create(): void {
        const { width, height } = this.scale;

        this.drawBackground();
        this.startConfetti();
        Sfx.playSuccess();

        this.add
            .text(width / 2, 120, 'Great Job!', {
                fontFamily: '"Titan One", cursive',
                fontSize: '90px',
                color: '#ffea00',
                stroke: '#111111',
                strokeThickness: 20,
                shadow: { offsetX: 8, offsetY: 8, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 230, `${this.summary.collected} fruits rescued`, {
                fontFamily: '"Titan One", cursive',
                fontSize: '46px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 12,
                shadow: { offsetX: 6, offsetY: 6, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        if (this.summary.mode === 'explorer') {
            this.add
                .text(width / 2, 290, `score ${this.summary.score}`, {
                    fontFamily: '"Titan One", cursive',
                    fontSize: '42px',
                    color: '#00f0b5',
                    stroke: '#111111',
                    strokeThickness: 12,
                    shadow: { offsetX: 6, offsetY: 6, color: '#111111', fill: true }
                })
                .setOrigin(0.5);
        }

        this.createButton(width / 2, 400, 340, 86, 0xff477e, 'Play Again', () => {
            this.scene.start('GameScene', { mode: this.summary.mode });
        });

        this.createButton(width / 2, 510, 340, 86, 0x8b6aff, 'Modes', () => {
            this.scene.start('MenuScene');
        });
    }

    private drawBackground(): void {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0xffd6e8);
        this.add.rectangle(width / 2, height - 40, width, 120, 0x00f0b5);
        this.add.rectangle(width / 2, height - 100, width, 12, 0x111111);

        const shapes = this.add.graphics();
        shapes.fillStyle(0xffffff, 1);
        shapes.fillEllipse(width * 0.26, 90, 220, 78);
        shapes.fillEllipse(width * 0.72, 100, 210, 72);
        
        shapes.lineStyle(8, 0x111111);
        shapes.strokeEllipse(width * 0.26, 90, 220, 78);
        shapes.strokeEllipse(width * 0.72, 100, 210, 72);
    }

    private startConfetti(): void {
        this.time.addEvent({
            delay: 120,
            loop: true,
            callback: () => {
                this.spawnConfettiPiece();
            }
        });
    }

    private spawnConfettiPiece(): void {
        const colors = [0xffe066, 0xff8f7e, 0x93e26f, 0x8fd9ff, 0xff9fd2];
        const x = Phaser.Math.Between(16, this.scale.width - 16);
        const piece = this.add.rectangle(x, -10, 10, 14, Phaser.Utils.Array.GetRandom(colors));

        piece.setAngle(Phaser.Math.Between(0, 45));

        this.tweens.add({
            targets: piece,
            y: this.scale.height + 18,
            x: x + Phaser.Math.Between(-40, 40),
            angle: piece.angle + Phaser.Math.Between(220, 540),
            duration: Phaser.Math.Between(1400, 2200),
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
        const shadow = this.add.rectangle(x + 8, y + 8, width, height, 0x111111);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x111111, 1);
        const text = this.add
            .text(x, y, label, {
                fontFamily: '"Titan One", cursive',
                fontSize: '44px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 10
            })
            .setOrigin(0.5);

        const clickTarget = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });

        clickTarget.on('pointerover', () => {
            panel.y = y - 4;
            panel.x = x - 4;
            text.y = y - 4;
            text.x = x - 4;
        });

        clickTarget.on('pointerout', () => {
            panel.y = y;
            panel.x = x;
            text.y = y;
            text.x = x;
        });

        clickTarget.on('pointerdown', () => {
            Sfx.playPop(1.1);
            onClick();
        });
    }
}
