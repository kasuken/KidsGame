import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameSummary, MonsterAccessory } from '../types';

export default class CelebrationScene extends Phaser.Scene {
    private summary: GameSummary = {
        mode: 'baby',
        mealsFed: 5,
        score: 0,
        unlockedAccessories: []
    };

    constructor() {
        super({ key: 'CelebrationScene' });
    }

    init(data: Partial<GameSummary>): void {
        this.summary = {
            mode: data.mode === 'explorer' ? 'explorer' : 'baby',
            mealsFed: data.mealsFed ?? 5,
            score: data.score ?? 0,
            unlockedAccessories: data.unlockedAccessories ?? []
        };
    }

    create(): void {
        const { width, height } = this.scale;
        this.drawBackground();
        this.startConfetti();
        Sfx.playSuccess();

        this.add
            .text(width / 2, 92, 'Full Tummy!', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '86px',
                color: '#ffd155',
                stroke: '#141414',
                strokeThickness: 18,
                shadow: { offsetX: 7, offsetY: 7, color: '#141414', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 190, this.getAccessoryLine(), {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '40px',
                color: '#ffffff',
                stroke: '#141414',
                strokeThickness: 11
            })
            .setOrigin(0.5);

        if (this.summary.mode === 'explorer') {
            this.add
                .text(width / 2, 245, `score ${this.summary.score}`, {
                    fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                    fontSize: '38px',
                    color: '#7bd35f',
                    stroke: '#141414',
                    strokeThickness: 10
                })
                .setOrigin(0.5);
        }

        this.drawAccessoryShelf(width / 2, 316);
        this.createButton(width / 2, 426, 330, 78, 0xff4f8b, 'Play Again', () => {
            this.scene.start('GameScene', { mode: this.summary.mode });
        });
        this.createButton(width / 2, 510, 330, 68, 0x8fdcff, 'Modes', () => this.scene.start('MenuScene'));
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0xfff7d7);
        this.add.rectangle(width / 2, height - 44, width, 124, 0x7bd35f);
        this.add.rectangle(width / 2, height - 108, width, 12, 0x141414);

        const shapes = this.add.graphics();
        shapes.lineStyle(8, 0x141414, 1);
        shapes.fillStyle(0xffffff, 1);
        shapes.fillEllipse(width * 0.2, 104, 220, 78);
        shapes.strokeEllipse(width * 0.2, 104, 220, 78);
        shapes.fillEllipse(width * 0.8, 94, 220, 74);
        shapes.strokeEllipse(width * 0.8, 94, 220, 74);
    }

    private drawAccessoryShelf(x: number, y: number): void {
        const shelf = this.add.graphics();
        shelf.fillStyle(0x141414, 1);
        shelf.fillRoundedRect(x - 216 + 8, y + 36 + 8, 432, 34, 14);
        shelf.fillStyle(0xffffff, 1);
        shelf.lineStyle(6, 0x141414, 1);
        shelf.fillRoundedRect(x - 216, y + 36, 432, 34, 14);
        shelf.strokeRoundedRect(x - 216, y + 36, 432, 34, 14);

        const accessories: MonsterAccessory[] = ['party-hat', 'bow', 'crown'];
        accessories.forEach((accessory, index) => {
            const itemX = x - 128 + index * 128;
            const unlocked = this.summary.unlockedAccessories.includes(accessory);
            this.drawAccessoryIcon(itemX, y, accessory, unlocked);
        });
    }

    private drawAccessoryIcon(x: number, y: number, accessory: MonsterAccessory, unlocked: boolean): void {
        const g = this.add.graphics();
        g.x = x;
        g.y = y;
        g.alpha = unlocked ? 1 : 0.28;
        g.lineStyle(6, 0x141414, 1);

        if (accessory === 'party-hat') {
            g.fillStyle(0xff4f8b, 1);
            g.fillTriangle(-28, 24, 0, -48, 30, 24);
            g.strokeTriangle(-28, 24, 0, -48, 30, 24);
            g.fillStyle(0xffd155, 1);
            g.fillCircle(0, -48, 8);
            g.strokeCircle(0, -48, 8);
        }

        if (accessory === 'bow') {
            g.fillStyle(0xff4f8b, 1);
            g.fillTriangle(-44, 0, -8, -24, -6, 22);
            g.strokeTriangle(-44, 0, -8, -24, -6, 22);
            g.fillTriangle(44, 0, 8, -24, 6, 22);
            g.strokeTriangle(44, 0, 8, -24, 6, 22);
            g.fillCircle(0, 0, 12);
            g.strokeCircle(0, 0, 12);
        }

        if (accessory === 'crown') {
            g.fillStyle(0xffd155, 1);
            g.fillTriangle(-44, 16, -30, -36, -14, 16);
            g.fillTriangle(-14, 16, 0, -48, 18, 16);
            g.fillTriangle(18, 16, 34, -36, 48, 16);
            g.fillRoundedRect(-50, 4, 100, 30, 8);
            g.strokeRoundedRect(-50, 4, 100, 30, 8);
        }
    }

    private startConfetti(): void {
        this.time.addEvent({
            delay: 105,
            loop: true,
            callback: () => this.spawnConfettiPiece()
        });
    }

    private spawnConfettiPiece(): void {
        const colors = [0xffd155, 0xff4f8b, 0x7bd35f, 0x8fdcff, 0xff8d38];
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
        this.add.rectangle(x + 8, y + 8, width, height, 0x141414);
        const panel = this.add.rectangle(x, y, width, height, color).setStrokeStyle(8, 0x141414, 1);
        const text = this.add
            .text(x, y, label, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: height > 70 ? '38px' : '34px',
                color: '#ffffff',
                stroke: '#141414',
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

    private getAccessoryLine(): string {
        const count = this.summary.unlockedAccessories.length;
        return count === 1 ? '1 accessory unlocked' : `${count} accessories unlocked`;
    }
}
