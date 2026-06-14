import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode, GameSummary } from '../types';

export default class CelebrationScene extends Phaser.Scene {
    private summary: GameSummary = {
        mode: 'all',
        level: 1,
        popped: 0,
        score: 0
    };

    constructor() {
        super({ key: 'CelebrationScene' });
    }

    init(data: Partial<GameSummary>): void {
        this.summary = {
            mode: this.normalizeMode(data.mode),
            level: data.level ?? 1,
            popped: data.popped ?? 0,
            score: data.score ?? 0
        };
    }

    create(): void {
        const { width, height } = this.scale;

        this.drawBackground();
        this.startConfetti();
        Sfx.playSuccess();

        this.add
            .text(width / 2, 116, 'Pop Party!', {
                fontFamily: '"Titan One", cursive',
                fontSize: '88px',
                color: '#ffd75e',
                stroke: '#111111',
                strokeThickness: 18,
                shadow: { offsetX: 8, offsetY: 8, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 226, `score ${this.summary.score}`, {
                fontFamily: '"Titan One", cursive',
                fontSize: '48px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 12,
                shadow: { offsetX: 6, offsetY: 6, color: '#111111', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 286, `level ${this.summary.level}`, {
                fontFamily: '"Nunito", sans-serif',
                fontSize: '32px',
                fontWeight: '900',
                color: '#111111'
            })
            .setOrigin(0.5);

        this.createButton(width / 2, 390, 360, 82, 0xff5c8a, 'Play Again', () => {
            this.scene.start('GameScene', { mode: this.summary.mode });
        });

        this.createButton(width / 2, 492, 360, 82, 0x48d7ff, 'Modes', () => {
            this.scene.start('MenuScene');
        });
    }

    private normalizeMode(mode?: GameMode): GameMode {
        if (mode === 'red' || mode === 'numbers' || mode === 'letters') {
            return mode;
        }

        return 'all';
    }

    private drawBackground(): void {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0xbceeff);
        this.add.rectangle(width / 2, height - 40, width, 120, 0x55d982);
        this.add.rectangle(width / 2, height - 100, width, 12, 0x111111);

        this.add.image(width * 0.18, 178, 'balloon-red').setScale(0.7).setAngle(-16);
        this.add.image(width * 0.82, 172, 'balloon-yellow').setScale(0.72).setAngle(13);
        this.add.image(width * 0.27, 356, 'balloon-green').setScale(0.58).setAngle(10);
        this.add.image(width * 0.74, 362, 'balloon-blue').setScale(0.58).setAngle(-11);
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
        const colors = [0xffd75e, 0xff5c8a, 0x55d982, 0x48d7ff, 0xffffff];
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
        this.add.rectangle(x + 8, y + 8, width, height, 0x111111);
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
