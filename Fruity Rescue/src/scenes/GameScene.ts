import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode, GameSummary, ModeSettings } from '../types';

const LEVEL_TARGETS = [3, 5, 10];
const FRUIT_EMOJIS = ['🍎', '🍌', '🍓'];

type FallingKind = 'fruit' | 'bad';
type FallingItem = (Phaser.GameObjects.Text | Phaser.Physics.Arcade.Sprite) & { body: Phaser.Physics.Arcade.Body };

const MODE_SETTINGS: Record<GameMode, ModeSettings> = {
    baby: {
        minFallSpeed: 55,
        maxFallSpeed: 95,
        minSpawnDelay: 1100,
        maxSpawnDelay: 1650,
        objectScale: 1.2,
        badObjectChance: 0
    },
    explorer: {
        minFallSpeed: 135,
        maxFallSpeed: 225,
        minSpawnDelay: 520,
        maxSpawnDelay: 900,
        objectScale: 0.98,
        badObjectChance: 0.22
    }
};

export default class GameScene extends Phaser.Scene {
    private mode: GameMode = 'baby';
    private settings: ModeSettings = MODE_SETTINGS.baby;
    private fallingItems!: Phaser.Physics.Arcade.Group;
    private basketGraphics!: Phaser.GameObjects.Graphics;
    private levelText!: Phaser.GameObjects.Text;
    private scoreText?: Phaser.GameObjects.Text;
    private progressDots: Phaser.GameObjects.Arc[] = [];
    private basketBounds = new Phaser.Geom.Rectangle();
    private levelIndex = 0;
    private targetFruit = LEVEL_TARGETS[0];
    private collected = 0;
    private score = 0;
    private finished = false;
    private groundY = 0;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { mode?: GameMode; levelIndex?: number; score?: number }): void {
        this.mode = data.mode === 'explorer' ? 'explorer' : 'baby';
        this.levelIndex = Phaser.Math.Clamp(data.levelIndex ?? 0, 0, LEVEL_TARGETS.length - 1);
        this.targetFruit = LEVEL_TARGETS[this.levelIndex];
        this.settings = MODE_SETTINGS[this.mode];
        this.collected = 0;
        this.score = data.score ?? 0;
        this.finished = false;
        this.progressDots = [];
    }

    create(): void {
        this.drawBackground();
        this.groundY = this.scale.height - 78;
        this.createBasket();
        this.createHud();

        this.fallingItems = this.physics.add.group();

        Sfx.unlock();
        this.input.on('pointerdown', () => Sfx.unlock());

        this.spawnLoop();
    }

    update(): void {
        if (this.finished) {
            return;
        }

        const children = this.fallingItems.getChildren() as FallingItem[];

        for (const item of children) {
            if (!item.active) {
                continue;
            }

            if (item.y > this.groundY + 22) {
                this.handleGroundContact(item);
            }
        }
    }

    private drawBackground(): void {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x8b6aff);
        this.add.rectangle(width / 2, height - 50, width, 140, 0x00f0b5);
        this.add.rectangle(width / 2, height - 120, width, 12, 0x111111);

        const clouds = this.add.graphics();
        clouds.fillStyle(0xffffff, 1);
        clouds.fillEllipse(width * 0.25, 120, 220, 80);
        clouds.fillEllipse(width * 0.31, 106, 150, 64);
        clouds.fillEllipse(width * 0.73, 92, 210, 76);
        clouds.fillEllipse(width * 0.67, 106, 150, 62);
        
        clouds.lineStyle(8, 0x111111);
        clouds.strokeEllipse(width * 0.25, 120, 220, 80);
        clouds.strokeEllipse(width * 0.31, 106, 150, 64);
        clouds.strokeEllipse(width * 0.73, 92, 210, 76);
        clouds.strokeEllipse(width * 0.67, 106, 150, 62);

        const trees = this.add.graphics();
        
        // Tree trunks
        trees.fillStyle(0xffea00, 1);
        trees.lineStyle(8, 0x111111);
        trees.fillRect(80, height - 220, 34, 138);
        trees.strokeRect(80, height - 220, 34, 138);
        trees.fillRect(width - 118, height - 200, 32, 118);
        trees.strokeRect(width - 118, height - 200, 32, 118);
        
        // Tree leaves
        trees.fillStyle(0xff477e, 1);
        trees.fillCircle(96, height - 226, 56);
        trees.strokeCircle(96, height - 226, 56);
        trees.fillCircle(width - 102, height - 212, 48);
        trees.strokeCircle(width - 102, height - 212, 48);
        
        trees.fillStyle(0xff729f, 1);
        trees.fillCircle(60, height - 210, 30);
        trees.strokeCircle(60, height - 210, 30);
        trees.fillCircle(width - 132, height - 196, 28);
        trees.strokeCircle(width - 132, height - 196, 28);
    }

    private createHud(): void {
        const dotGap = 40;
        const firstDotX = this.scale.width / 2 - ((this.targetFruit - 1) * dotGap) / 2;

        for (let i = 0; i < this.targetFruit; i += 1) {
            const shadow = this.add.circle(firstDotX + i * dotGap + 4, 42, 12, 0x111111, 1);
            const dot = this.add.circle(firstDotX + i * dotGap, 38, 12, 0xffffff, 1);
            dot.setStrokeStyle(4, 0x111111, 1);
            this.progressDots.push(dot);
        }

        this.levelText = this.add
            .text(this.scale.width / 2, 16, this.getLevelLabel(), {
                fontFamily: '"Titan One", cursive',
                fontSize: '32px',
                color: '#ffea00',
                stroke: '#111111',
                strokeThickness: 10,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            })
            .setOrigin(0.5, 0);

        this.add
            .text(this.scale.width - 22, 18, this.mode === 'baby' ? 'Baby' : 'Explorer', {
                fontFamily: '"Titan One", cursive',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 8,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            })
            .setOrigin(1, 0);

        if (this.mode === 'explorer') {
            this.scoreText = this.add.text(22, 18, 'SCORE 0', {
                fontFamily: '"Titan One", cursive',
                fontSize: '32px',
                color: '#ffea00',
                stroke: '#111111',
                strokeThickness: 8,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            });
        }

        const homeBtn = this.add
            .text(this.scale.width - 22, this.scale.height - 20, 'HOME', {
                fontFamily: '"Titan One", cursive',
                fontSize: '28px',
                color: '#ff477e',
                stroke: '#111111',
                strokeThickness: 8,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            })
            .setOrigin(1, 1)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            });
            
        homeBtn.on('pointerover', () => homeBtn.setScale(1.1));
        homeBtn.on('pointerout', () => homeBtn.setScale(1));

        this.updateHud();
    }

    private createBasket(): void {
        const basketWidth = 300;
        const basketHeight = 90;
        this.basketBounds = new Phaser.Geom.Rectangle(
            (this.scale.width - basketWidth) / 2,
            this.scale.height - 122,
            basketWidth,
            basketHeight
        );
        this.basketGraphics = this.add.graphics();
        this.redrawBasket();
    }

    private redrawBasket(): void {
        const fillRatio = Phaser.Math.Clamp(this.collected / this.targetFruit, 0, 1);
        const { x, y, width, height } = this.basketBounds;

        this.basketGraphics.clear();
        
        // Basket shadow
        this.basketGraphics.fillStyle(0x111111, 1);
        this.basketGraphics.fillEllipse(x + width / 2 + 10, y + height + 15 + 10, width * 0.92, 32);

        this.basketGraphics.fillStyle(0xffea00, 1);
        this.basketGraphics.lineStyle(8, 0x111111, 1);
        this.basketGraphics.fillEllipse(x + width / 2, y + height + 15, width * 0.92, 32);
        this.basketGraphics.strokeEllipse(x + width / 2, y + height + 15, width * 0.92, 32);

        if (fillRatio > 0) {
            const innerHeight = height - 22;
            const fillHeight = innerHeight * fillRatio;

            this.basketGraphics.fillStyle(0xff477e, 1);
            this.basketGraphics.lineStyle(6, 0x111111, 1);
            this.basketGraphics.fillRoundedRect(x + 12, y + height - 10 - fillHeight, width - 24, fillHeight, 18);
            this.basketGraphics.strokeRoundedRect(x + 12, y + height - 10 - fillHeight, width - 24, fillHeight, 18);
        }

        this.basketGraphics.fillStyle(0x8f5d34, 1);
        this.basketGraphics.fillRoundedRect(x, y, width, height, 26);
        this.basketGraphics.lineStyle(8, 0xb77a45, 1);
        this.basketGraphics.strokeRoundedRect(x + 4, y + 4, width - 8, height - 8, 22);
    }

    private spawnLoop(): void {
        if (this.finished) {
            return;
        }

        this.spawnObject();

        const pace = this.getPaceMultiplier();
        const delay = Phaser.Math.Between(
            Math.floor(this.settings.minSpawnDelay / pace),
            Math.floor(this.settings.maxSpawnDelay / pace)
        );

        this.time.delayedCall(Math.max(260, delay), () => this.spawnLoop());
    }

    private spawnObject(): void {
        if (this.finished) {
            return;
        }

        const spawnBad = this.mode === 'explorer' && Math.random() < this.settings.badObjectChance;
        const item = spawnBad ? this.createBadItem() : this.createFruitItem();

        item.setActive(true);
        item.setVisible(true);
        item.setData('kind', spawnBad ? 'bad' : 'fruit');
        item.setInteractive({ useHandCursor: true });

        const speed = Phaser.Math.Between(this.settings.minFallSpeed, this.settings.maxFallSpeed) * this.getPaceMultiplier();
        item.body.setVelocity(Phaser.Math.Between(-24, 24), speed);
        item.body.angularVelocity = Phaser.Math.Between(-70, 70);
        item.setDepth(10);
        item.on('pointerdown', () => this.handleTap(item));
    }

    private createBadItem(): FallingItem {
        return this.fallingItems.create(
            Phaser.Math.Between(70, this.scale.width - 70),
            -46,
            'bad-yuck'
        ).setScale(this.settings.objectScale) as FallingItem;
    }

    private createFruitItem(): FallingItem {
        const item = this.add
            .text(
                Phaser.Math.Between(70, this.scale.width - 70),
                -46,
                Phaser.Utils.Array.GetRandom(FRUIT_EMOJIS),
                {
                    fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                    fontSize: `${Math.round(58 * this.settings.objectScale)}px`
                }
            )
            .setOrigin(0.5);

        this.physics.add.existing(item);
        item.body.setSize(58 * this.settings.objectScale, 58 * this.settings.objectScale);
        this.fallingItems.add(item);

        return item as FallingItem;
    }

    private handleTap(item: FallingItem): void {
        if (this.finished || !item.active) {
            return;
        }

        const kind = item.getData('kind') as FallingKind;
        this.playBurst(item.x, item.y, kind === 'fruit' ? 0xffee96 : 0xa4d464);
        item.destroy();

        if (kind === 'fruit') {
            this.collected += 1;

            if (this.mode === 'explorer') {
                this.score += 1;
            }

            Sfx.playPop();
            this.updateHud();

            if (this.collected >= this.targetFruit) {
                this.finishRound();
            }

            return;
        }

        if (this.mode === 'explorer') {
            this.score = Math.max(0, this.score - 1);
        }

        this.cameras.main.shake(90, 0.0036);
        Sfx.playSoftMistake();
        this.updateHud();
    }

    private handleGroundContact(item: FallingItem): void {
        if (this.finished || !item.active) {
            return;
        }

        const kind = item.getData('kind') as FallingKind;
        item.destroy();

        if (kind !== 'fruit') {
            return;
        }

        if (this.mode === 'baby') {
            this.collected += 1;
              this.playBurst(item.x, this.groundY - 10, 0xffea00);

            if (this.collected >= this.targetFruit) {
                this.finishRound();
            }

            return;
        }

        this.score = Math.max(0, this.score - 1);
        Sfx.playSoftMistake(0.7);
        this.updateHud();
    }

    private playBurst(x: number, y: number, color: number): void {
        for (let i = 0; i < 8; i += 1) {
            const dot = this.add.circle(x, y, 3, color, 1);
            const angle = (Math.PI * 2 * i) / 8;
            const distance = Phaser.Math.Between(18, 30);

            this.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 230,
                ease: 'Cubic.Out',
                onComplete: () => dot.destroy()
            });
        }
    }

    private getPaceMultiplier(): number {
        const progress = Phaser.Math.Clamp(this.collected / this.targetFruit, 0, 1);
        const maxBoost = this.mode === 'baby' ? 1.12 : 1.56;
        return Phaser.Math.Linear(1, maxBoost, progress);
    }

    private updateHud(): void {
        this.progressDots.forEach((dot, index) => {
            if (index < this.collected) {
                dot.setFillStyle(0xffea00, 1);
                dot.setStrokeStyle(4, 0x111111, 1);
                return;
            }

            dot.setFillStyle(0xffffff, 1);
            dot.setStrokeStyle(4, 0x111111, 1);
        });

        this.redrawBasket();

        if (this.scoreText) {
            this.scoreText.setText(`SCORE ${this.score}`);
        }

        if (this.levelText) {
            this.levelText.setText(this.getLevelLabel());
        }
    }

    private finishRound(): void {
        if (this.finished) {
            return;
        }

        this.finished = true;
        this.fallingItems.clear(true, true);
        Sfx.playSuccess();

        const nextLevelIndex = this.levelIndex + 1;
        if (nextLevelIndex < LEVEL_TARGETS.length) {
            const nextTarget = LEVEL_TARGETS[nextLevelIndex];
            this.showLevelAdvance(nextLevelIndex, nextTarget);

            this.time.delayedCall(1050, () => {
                this.scene.start('GameScene', {
                    mode: this.mode,
                    levelIndex: nextLevelIndex,
                    score: this.score
                });
            });
            return;
        }

        const summary: GameSummary = {
            mode: this.mode,
            collected: this.collected,
            score: this.score
        };

        this.time.delayedCall(680, () => {
            this.scene.start('CelebrationScene', summary);
        });
    }

    private getLevelLabel(): string {
        return `Level ${this.levelIndex + 1}/${LEVEL_TARGETS.length}  Target ${this.targetFruit}`;
    }

    private showLevelAdvance(nextLevelIndex: number, nextTarget: number): void {
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2 - 40, 460, 130, 0xffffff, 0.88);
        panel.setStrokeStyle(4, 0x67a0cc, 1);
        panel.setDepth(1000);

        const message = this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 2 - 40,
                `Level ${this.levelIndex + 1} complete!\nNext: Level ${nextLevelIndex + 1} (${nextTarget} fruits)`,
                {
                    fontFamily: 'Baloo 2, Trebuchet MS, sans-serif',
                    fontSize: '30px',
                    color: '#2c4e63',
                    align: 'center'
                }
            )
            .setOrigin(0.5)
            .setDepth(1001);

        this.tweens.add({
            targets: [panel, message],
            alpha: 0,
            delay: 720,
            duration: 260,
            ease: 'Quad.Out',
            onComplete: () => {
                panel.destroy();
                message.destroy();
            }
        });
    }
}
