import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode, GameSummary } from '../types';

export default class CelebrationScene extends Phaser.Scene {
    private summary: GameSummary = {
        mode: 'little',
        placed: 0,
        score: 0
    };

    constructor() {
        super({ key: 'CelebrationScene' });
    }

    init(data: Partial<GameSummary>): void {
        this.summary = {
            mode: data.mode === 'big' ? 'big' : 'little',
            placed: data.placed ?? 0,
            score: data.score ?? 0
        };
    }

    create(): void {
        const { width, height } = this.scale;
        this.drawBackground();
        this.startConfetti();
        Sfx.playSuccess();

        this.add.text(width / 2, 104, 'Zoo Open!', {
            fontFamily: '"Cherry Bomb One", "Titan One", cursive',
            fontSize: '88px',
            color: '#ffffff',
            stroke: '#22322d',
            strokeThickness: 17,
            shadow: { offsetX: 8, offsetY: 8, color: '#22322d', fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, 212, `${this.summary.placed} happy animals`, {
            fontFamily: '"Titan One", cursive',
            fontSize: '48px',
            color: '#ffd66b',
            stroke: '#22322d',
            strokeThickness: 10
        }).setOrigin(0.5);

        this.add.text(width / 2, 270, `score ${this.summary.score}`, {
            fontFamily: '"Nunito", sans-serif',
            fontSize: '30px',
            fontWeight: '900',
            color: '#22322d'
        }).setOrigin(0.5);

        this.createButton(width / 2, 382, 356, 78, 0x74d6b7, 'Play Again', () => {
            this.scene.start('GameScene', { mode: this.summary.mode });
        });
        this.createButton(width / 2, 482, 356, 78, 0xff9f70, 'Zoo Gates', () => {
            this.scene.start('MenuScene');
        });
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0xfff1c9);
        this.add.rectangle(width / 2, height - 45, width, 110, 0x8bd36f);
        this.add.rectangle(width / 2, height - 100, width, 9, 0x22322d);
        this.add.text(132, 326, '🐧', { fontSize: '68px' }).setOrigin(0.5).setAngle(-10);
        this.add.text(width - 132, 320, '🦁', { fontSize: '78px' }).setOrigin(0.5).setAngle(10);
        this.add.text(184, 172, '🐠', { fontSize: '62px' }).setOrigin(0.5).setAngle(12);
        this.add.text(width - 184, 176, '🐒', { fontSize: '62px' }).setOrigin(0.5).setAngle(-12);
    }

    private startConfetti(): void {
        this.time.addEvent({
            delay: 120,
            loop: true,
            callback: () => this.spawnLeaf()
        });
    }

    private spawnLeaf(): void {
        const colors = [0x74d6b7, 0x8bd36f, 0xffd66b, 0xff9f70, 0xffffff];
        const x = Phaser.Math.Between(16, this.scale.width - 16);
        const leaf = this.add.ellipse(x, -12, 18, 10, Phaser.Utils.Array.GetRandom(colors));
        leaf.setStrokeStyle(3, 0x22322d, 1);
        this.tweens.add({
            targets: leaf,
            y: this.scale.height + 18,
            x: x + Phaser.Math.Between(-58, 58),
            angle: Phaser.Math.Between(180, 540),
            duration: Phaser.Math.Between(1500, 2400),
            ease: 'Sine.In',
            onComplete: () => leaf.destroy()
        });
    }

    private createButton(x: number, y: number, width: number, height: number, color: number, label: string, onClick: () => void): void {
        this.add.rectangle(x + 8, y + 8, width, height, 0x22322d);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x22322d, 1);
        const text = this.add.text(x, y, label, {
            fontFamily: '"Titan One", cursive',
            fontSize: '39px',
            color: '#ffffff',
            stroke: '#22322d',
            strokeThickness: 9
        }).setOrigin(0.5);
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
