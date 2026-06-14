import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode, GameSummary, ModeSettings, TreasureKind, TreasureProfile } from '../types';

const TREASURES: Record<TreasureKind, TreasureProfile> = {
    shell: { kind: 'shell', name: 'Shell', plural: 'Shells', emoji: '🐚', color: 0xff9fb5, sparkle: 0xffffff, message: 'A shiny shell!' },
    coin: { kind: 'coin', name: 'Coin', plural: 'Coins', emoji: '🪙', color: 0xffdf55, sparkle: 0xfff6bf, message: 'Gold coin sparkle!' },
    pirate: { kind: 'pirate', name: 'Pirate', plural: 'Pirates', emoji: '🏴‍☠️', color: 0x3d5a80, sparkle: 0xffffff, message: 'Ahoy, tiny pirate!' },
    crab: { kind: 'crab', name: 'Crab', plural: 'Crabs', emoji: '🦀', color: 0xff7043, sparkle: 0xffcf67, message: 'A dancing crab!' }
};

const MODE_SETTINGS: Record<GameMode, ModeSettings> = {
    baby: { piles: 8, bonusTarget: 0 },
    explorer: { piles: 12, bonusTarget: 4 }
};

interface SandPile {
    x: number;
    y: number;
    treasure: TreasureProfile;
    dug: boolean;
    mound: Phaser.GameObjects.Graphics;
    target: Phaser.GameObjects.Rectangle;
}

export default class GameScene extends Phaser.Scene {
    private mode: GameMode = 'baby';
    private settings: ModeSettings = MODE_SETTINGS.baby;
    private piles: SandPile[] = [];
    private promptText!: Phaser.GameObjects.Text;
    private foundText!: Phaser.GameObjects.Text;
    private scoreText?: Phaser.GameObjects.Text;
    private counts: Record<TreasureKind, number> = { shell: 0, coin: 0, pirate: 0, crab: 0 };
    private found = 0;
    private score = 0;
    private finished = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { mode?: GameMode }): void {
        this.mode = data.mode === 'explorer' ? 'explorer' : 'baby';
        this.settings = MODE_SETTINGS[this.mode];
        this.piles = [];
        this.counts = { shell: 0, coin: 0, pirate: 0, crab: 0 };
        this.found = 0;
        this.score = 0;
        this.finished = false;
        this.scoreText = undefined;
    }

    create(): void {
        this.drawBackground();
        this.createHud();
        this.createSandPiles();
        Sfx.unlock();
        this.input.on('pointerdown', () => Sfx.unlock());
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x73d9ff);
        this.add.rectangle(width / 2, height - 212, width, 84, 0x2aa7cf, 1);
        this.add.rectangle(width / 2, height - 172, width, 30, 0xffffff, 0.85);
        this.add.rectangle(width / 2, height - 72, width, 206, 0xffcf67, 1);
        this.add.rectangle(width / 2, height - 177, width, 10, 0x17445f, 1);

        const g = this.add.graphics();
        g.lineStyle(7, 0x17445f, 1);
        g.fillStyle(0xff8c4b, 1);
        g.fillCircle(width - 76, 70, 43);
        g.strokeCircle(width - 76, 70, 43);
        g.fillStyle(0xffffff, 0.92);
        g.fillEllipse(138, 78, 210, 70);
        g.strokeEllipse(138, 78, 210, 70);
        g.fillEllipse(374, 96, 188, 62);
        g.strokeEllipse(374, 96, 188, 62);

        for (let x = -40; x < width + 80; x += 120) {
            g.beginPath();
            g.arc(x, height - 214, 48, 0, Math.PI, false);
            g.strokePath();
        }

        this.add.text(82, height - 246, '⛵', { fontSize: '58px' }).setOrigin(0.5).setAngle(-7);
        this.add.text(width - 86, height - 126, '🌴', { fontSize: '72px' }).setOrigin(0.5).setAngle(8);
    }

    private createHud(): void {
        this.promptText = this.add
            .text(this.scale.width / 2, 20, 'Tap a sand pile!', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '34px',
                color: '#fff6bf',
                stroke: '#17445f',
                strokeThickness: 9,
                shadow: { offsetX: 4, offsetY: 4, color: '#17445f', fill: true }
            })
            .setOrigin(0.5, 0)
            .setDepth(80);

        this.foundText = this.add
            .text(22, 20, `0/${this.settings.piles}`, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '30px',
                color: '#ffffff',
                stroke: '#17445f',
                strokeThickness: 8
            })
            .setDepth(80);

        this.add
            .text(this.scale.width - 24, 20, this.mode === 'baby' ? 'Tiny Dig' : 'Big Dig', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#17445f',
                strokeThickness: 8
            })
            .setOrigin(1, 0)
            .setDepth(80);

        if (this.mode === 'explorer') {
            this.scoreText = this.add
                .text(24, 62, 'SCORE 0', {
                    fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                    fontSize: '26px',
                    color: '#fff6bf',
                    stroke: '#17445f',
                    strokeThickness: 7
                })
                .setDepth(80);
        }

        this.createCollectionShelf();

        const homeBtn = this.add
            .text(this.scale.width - 24, this.scale.height - 18, 'HOME', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '28px',
                color: '#ff7043',
                stroke: '#17445f',
                strokeThickness: 8
            })
            .setOrigin(1, 1)
            .setDepth(90)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MenuScene'));

        homeBtn.on('pointerover', () => homeBtn.setScale(1.1));
        homeBtn.on('pointerout', () => homeBtn.setScale(1));
    }

    private createCollectionShelf(): void {
        const shelfY = 122;
        const startX = this.scale.width / 2 - 210;
        Object.values(TREASURES).forEach((treasure, index) => {
            const x = startX + index * 140;
            this.add.rectangle(x + 5, shelfY + 5, 112, 52, 0x17445f).setDepth(75);
            this.add.rectangle(x, shelfY, 112, 52, 0xfff6bf).setStrokeStyle(5, 0x17445f).setDepth(76);
            this.add.text(x - 26, shelfY, treasure.emoji, { fontSize: '28px' }).setOrigin(0.5).setDepth(77);
            this.add
                .text(x + 24, shelfY, '0', {
                    fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                    fontSize: '25px',
                    color: '#17445f'
                })
                .setName(`count-${treasure.kind}`)
                .setOrigin(0.5)
                .setDepth(77);
        });
    }

    private createSandPiles(): void {
        const treasures = this.createTreasureQueue();
        const positions = this.createPilePositions();

        positions.forEach((position, index) => {
            const mound = this.add.graphics().setDepth(20 + index);
            const pile: SandPile = {
                x: position.x,
                y: position.y,
                treasure: treasures[index],
                dug: false,
                mound,
                target: this.add.rectangle(position.x, position.y, 132, 92, 0x000000, 0.001).setDepth(50).setInteractive({ useHandCursor: true })
            };
            this.drawPile(pile, 1);
            pile.target.on('pointerdown', () => this.digPile(pile));
            pile.target.on('pointerover', () => !pile.dug && this.tweens.add({ targets: pile.target, scaleX: 1.08, scaleY: 1.08, duration: 120 }));
            pile.target.on('pointerout', () => this.tweens.add({ targets: pile.target, scaleX: 1, scaleY: 1, duration: 120 }));
            this.piles.push(pile);
        });
    }

    private createTreasureQueue(): TreasureProfile[] {
        const order: TreasureKind[] = ['shell', 'coin', 'pirate', 'crab'];
        const queue: TreasureProfile[] = [];
        for (let i = 0; i < this.settings.piles; i += 1) {
            queue.push(TREASURES[order[i % order.length]]);
        }
        return Phaser.Utils.Array.Shuffle(queue);
    }

    private createPilePositions(): Array<{ x: number; y: number }> {
        const rows = this.mode === 'baby' ? [304, 416] : [274, 366, 458];
        const columns = this.mode === 'baby' ? [176, 378, 580, 782] : [152, 370, 590, 808];
        const positions: Array<{ x: number; y: number }> = [];

        rows.forEach((y, rowIndex) => {
            columns.forEach((x, columnIndex) => {
                positions.push({ x: x + (rowIndex % 2 === 0 ? 0 : 18), y: y + (columnIndex % 2 === 0 ? 0 : 8) });
            });
        });

        return positions.slice(0, this.settings.piles);
    }

    private drawPile(pile: SandPile, scale: number): void {
        pile.mound.clear();
        pile.mound.fillStyle(0x17445f, 0.34);
        pile.mound.fillEllipse(pile.x + 8, pile.y + 16, 124 * scale, 40 * scale);
        pile.mound.fillStyle(0xf4b95c, 1);
        pile.mound.lineStyle(6, 0x17445f, 1);
        pile.mound.fillEllipse(pile.x, pile.y, 126 * scale, 70 * scale);
        pile.mound.strokeEllipse(pile.x, pile.y, 126 * scale, 70 * scale);
        pile.mound.fillStyle(0xffe29a, 0.9);
        pile.mound.fillEllipse(pile.x - 18, pile.y - 12, 48 * scale, 16 * scale);
        pile.mound.fillCircle(pile.x + 28, pile.y - 6, 7 * scale);
    }

    private digPile(pile: SandPile): void {
        if (pile.dug || this.finished) {
            return;
        }

        pile.dug = true;
        pile.target.disableInteractive();
        pile.mound.clear();
        this.found += 1;
        this.counts[pile.treasure.kind] += 1;
        this.score += this.mode === 'explorer' ? this.scoreTreasure(pile.treasure.kind) : 1;
        this.promptText.setText(pile.treasure.message);
        this.updateHud();
        Sfx.playHappy();
        this.cameras.main.shake(70, 0.0018);

        const hole = this.add.graphics().setDepth(25);
        hole.fillStyle(0xb8793f, 1);
        hole.lineStyle(5, 0x17445f, 1);
        hole.fillEllipse(pile.x, pile.y + 12, 118, 54);
        hole.strokeEllipse(pile.x, pile.y + 12, 118, 54);

        const prize = this.add
            .text(pile.x, pile.y + 18, pile.treasure.emoji, {
                fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                fontSize: pile.treasure.kind === 'pirate' ? '50px' : '58px'
            })
            .setOrigin(0.5)
            .setScale(0.2)
            .setDepth(70);

        this.tweens.add({ targets: prize, y: pile.y - 34, scale: 1, angle: Phaser.Math.Between(-8, 8), duration: 330, ease: 'Back.Out' });
        this.playSparkles(pile.x, pile.y - 24, pile.treasure.sparkle, pile.treasure.color);
        this.time.delayedCall(520, () => this.checkFinish());
    }

    private scoreTreasure(kind: TreasureKind): number {
        if (kind === 'coin') {
            return 3;
        }
        if (kind === 'pirate') {
            return 2;
        }
        return 1;
    }

    private playSparkles(x: number, y: number, primary: number, secondary: number): void {
        for (let i = 0; i < 14; i += 1) {
            const sparkle = this.add.text(x, y, i % 3 === 0 ? '✨' : '•', {
                fontSize: i % 3 === 0 ? '22px' : '34px',
                color: i % 2 === 0 ? '#ffffff' : '#fff6bf'
            }).setOrigin(0.5).setDepth(90);
            if (i % 3 !== 0) {
                sparkle.setTint(i % 2 === 0 ? primary : secondary);
            }
            const angle = (Math.PI * 2 * i) / 14;
            const distance = Phaser.Math.Between(32, 70);
            this.tweens.add({
                targets: sparkle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.2,
                duration: 440,
                ease: 'Cubic.Out',
                onComplete: () => sparkle.destroy()
            });
        }
    }

    private checkFinish(): void {
        if (this.found < this.settings.piles || this.finished) {
            return;
        }

        this.finished = true;
        if (this.mode === 'explorer' && Object.values(this.counts).every((count) => count >= this.settings.bonusTarget / 2)) {
            this.score += this.settings.bonusTarget;
        }
        Sfx.playSuccess();
        const summary: GameSummary = { mode: this.mode, treasuresFound: this.found, score: this.score };
        this.time.delayedCall(820, () => this.scene.start('CelebrationScene', summary));
    }

    private updateHud(): void {
        this.foundText.setText(`${this.found}/${this.settings.piles}`);
        if (this.scoreText) {
            this.scoreText.setText(`SCORE ${this.score}`);
        }
        Object.entries(this.counts).forEach(([kind, count]) => {
            const countText = this.children.getByName(`count-${kind}`) as Phaser.GameObjects.Text | null;
            countText?.setText(`${count}`);
        });
    }
}
