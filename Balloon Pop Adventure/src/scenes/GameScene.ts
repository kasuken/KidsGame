import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { BalloonData, GameMode, ModeSettings } from '../types';

const BALLOON_TEXTURES = {
    red: 'balloon-red',
    yellow: 'balloon-yellow',
    blue: 'balloon-blue',
    green: 'balloon-green'
} as const;

const COLOR_NAMES: BalloonData['colorName'][] = ['red', 'yellow', 'blue', 'green'];
const NUMBER_VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const LETTER_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

const MODE_SETTINGS: Record<GameMode, ModeSettings> = {
    all: {
        label: 'All Balloons',
        instruction: 'Pop every balloon',
        targetCount: 8,
        minRiseSpeed: 62,
        maxRiseSpeed: 112,
        minSpawnDelay: 760,
        maxSpawnDelay: 1180,
        objectScale: 0.72,
        distractorChance: 0
    },
    red: {
        label: 'Red Balloons',
        instruction: 'Pop only red',
        targetCount: 7,
        minRiseSpeed: 72,
        maxRiseSpeed: 128,
        minSpawnDelay: 650,
        maxSpawnDelay: 1040,
        objectScale: 0.72,
        distractorChance: 0.54
    },
    numbers: {
        label: 'Numbers',
        instruction: 'Pop numbers',
        targetCount: 8,
        minRiseSpeed: 74,
        maxRiseSpeed: 136,
        minSpawnDelay: 610,
        maxSpawnDelay: 980,
        objectScale: 0.74,
        distractorChance: 0.42
    },
    letters: {
        label: 'Letters',
        instruction: 'Pop letters',
        targetCount: 8,
        minRiseSpeed: 74,
        maxRiseSpeed: 136,
        minSpawnDelay: 610,
        maxSpawnDelay: 980,
        objectScale: 0.74,
        distractorChance: 0.42
    }
};

export default class GameScene extends Phaser.Scene {
    private mode: GameMode = 'all';
    private settings: ModeSettings = MODE_SETTINGS.all;
    private balloons!: Phaser.Physics.Arcade.Group;
    private levelText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private taskText!: Phaser.GameObjects.Text;
    private progressBar!: Phaser.GameObjects.Rectangle;
    private progressFrame!: Phaser.GameObjects.Rectangle;
    private level = 1;
    private popped = 0;
    private score = 0;
    private finished = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { mode?: GameMode; level?: number; score?: number }): void {
        this.mode = this.normalizeMode(data.mode);
        this.settings = MODE_SETTINGS[this.mode];
        this.level = Math.max(1, data.level ?? 1);
        this.score = data.score ?? 0;
        this.popped = 0;
        this.finished = false;
    }

    create(): void {
        this.drawBackground();
        this.createHud();
        this.balloons = this.physics.add.group();

        Sfx.unlock();
        this.input.on('pointerdown', () => Sfx.unlock());

        this.spawnLoop();
    }

    update(): void {
        if (this.finished) {
            return;
        }

        const children = this.balloons.getChildren() as Phaser.Physics.Arcade.Sprite[];

        for (const balloon of children) {
            this.syncBalloonLabel(balloon);

            if (balloon.active && balloon.y < -95) {
                this.handleEscape(balloon);
            }
        }
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
        this.add.rectangle(width / 2, height - 42, width, 112, 0x55d982);
        this.add.rectangle(width / 2, height - 99, width, 12, 0x111111);

        const clouds = this.add.graphics();
        clouds.fillStyle(0xffffff, 1);
        clouds.fillEllipse(width * 0.18, 94, 200, 70);
        clouds.fillEllipse(width * 0.47, 72, 250, 80);
        clouds.fillEllipse(width * 0.81, 116, 220, 72);
        clouds.lineStyle(8, 0x111111);
        clouds.strokeEllipse(width * 0.18, 94, 200, 70);
        clouds.strokeEllipse(width * 0.47, 72, 250, 80);
        clouds.strokeEllipse(width * 0.81, 116, 220, 72);

        const hills = this.add.graphics();
        hills.fillStyle(0x2fcf7a, 1);
        hills.lineStyle(8, 0x111111, 1);
        hills.fillEllipse(160, height - 50, 360, 118);
        hills.strokeEllipse(160, height - 50, 360, 118);
        hills.fillEllipse(width - 170, height - 54, 420, 128);
        hills.strokeEllipse(width - 170, height - 54, 420, 128);
    }

    private createHud(): void {
        this.levelText = this.add
            .text(22, 18, `LEVEL ${this.level}`, {
                fontFamily: '"Titan One", cursive',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 8,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            })
            .setDepth(50);

        this.scoreText = this.add
            .text(this.scale.width - 22, 18, `SCORE ${this.score}`, {
                fontFamily: '"Titan One", cursive',
                fontSize: '32px',
                color: '#ffd75e',
                stroke: '#111111',
                strokeThickness: 8,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            })
            .setOrigin(1, 0)
            .setDepth(50);

        this.taskText = this.add
            .text(this.scale.width / 2, 20, this.settings.instruction, {
                fontFamily: '"Titan One", cursive',
                fontSize: '34px',
                color: '#ff5c8a',
                stroke: '#111111',
                strokeThickness: 9,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            })
            .setOrigin(0.5, 0)
            .setDepth(50);

        this.add.rectangle(this.scale.width / 2 + 4, 82, 324, 28, 0x111111).setDepth(50);
        this.progressFrame = this.add.rectangle(this.scale.width / 2, 78, 324, 28, 0xffffff).setStrokeStyle(5, 0x111111, 1).setDepth(51);
        this.progressBar = this.add.rectangle(this.scale.width / 2 - 156, 78, 0, 18, 0xffd75e).setOrigin(0, 0.5).setDepth(52);

        const homeBtn = this.add
            .text(this.scale.width - 24, this.scale.height - 20, 'HOME', {
                fontFamily: '"Titan One", cursive',
                fontSize: '28px',
                color: '#ff5c8a',
                stroke: '#111111',
                strokeThickness: 8,
                shadow: { offsetX: 4, offsetY: 4, color: '#111111', fill: true }
            })
            .setOrigin(1, 1)
            .setDepth(60)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            });

        homeBtn.on('pointerover', () => homeBtn.setScale(1.1));
        homeBtn.on('pointerout', () => homeBtn.setScale(1));

        this.updateHud();
    }

    private spawnLoop(): void {
        if (this.finished) {
            return;
        }

        this.spawnBalloon();

        const pace = this.getPaceMultiplier();
        const delay = Phaser.Math.Between(
            Math.floor(this.settings.minSpawnDelay / pace),
            Math.floor(this.settings.maxSpawnDelay / pace)
        );

        this.time.delayedCall(Math.max(210, delay), () => this.spawnLoop());
    }

    private spawnBalloon(): void {
        if (this.finished) {
            return;
        }

        const balloonData = this.createBalloonData();
        const balloon = this.balloons.create(
            Phaser.Math.Between(74, this.scale.width - 74),
            this.scale.height + 88,
            BALLOON_TEXTURES[balloonData.colorName]
        ) as Phaser.Physics.Arcade.Sprite;

        balloon.setData('balloonData', balloonData);
        balloon.setScale(this.settings.objectScale);
        balloon.setInteractive({ useHandCursor: true });
        balloon.setDepth(12);
        balloon.setVelocity(Phaser.Math.Between(balloonData.value ? -7 : -16, balloonData.value ? 7 : 16), -this.getRiseSpeed());
        balloon.setAngularVelocity(Phaser.Math.Between(balloonData.value ? -5 : -18, balloonData.value ? 5 : 18));
        balloon.on('pointerdown', () => this.handlePop(balloon));

        if (balloonData.value) {
            this.addBalloonLabel(balloon, balloonData.value);
        }
    }

    private createBalloonData(): BalloonData {
        if (this.mode === 'all') {
            return {
                kind: 'color',
                colorName: Phaser.Utils.Array.GetRandom(COLOR_NAMES),
                value: '',
                isTarget: true
            };
        }

        if (this.mode === 'red') {
            const isTarget = Math.random() >= this.settings.distractorChance;
            return {
                kind: 'color',
                colorName: isTarget ? 'red' : Phaser.Utils.Array.GetRandom(['yellow', 'blue', 'green'] as BalloonData['colorName'][]),
                value: '',
                isTarget
            };
        }

        const targetKind: BalloonData['kind'] = this.mode === 'numbers' ? 'number' : 'letter';
        const distractorKind: BalloonData['kind'] = this.mode === 'numbers' ? 'letter' : 'number';
        const isTarget = Math.random() >= this.settings.distractorChance;
        const kind = isTarget ? targetKind : distractorKind;
        const values = kind === 'number' ? NUMBER_VALUES : LETTER_VALUES;

        return {
            kind,
            colorName: Phaser.Utils.Array.GetRandom(COLOR_NAMES),
            value: Phaser.Utils.Array.GetRandom(values),
            isTarget
        };
    }

    private addBalloonLabel(balloon: Phaser.Physics.Arcade.Sprite, value: string): void {
        const label = this.add
            .text(balloon.x, balloon.y - 14, value, {
                fontFamily: '"Titan One", cursive',
                fontSize: '34px',
                color: '#ffffff',
                stroke: '#111111',
                strokeThickness: 6
            })
            .setOrigin(0.5)
            .setDepth(balloon.depth + 1);

        balloon.setData('label', label);
        this.syncBalloonLabel(balloon);
    }

    private syncBalloonLabel(balloon: Phaser.Physics.Arcade.Sprite): void {
        const label = balloon.getData('label') as Phaser.GameObjects.Text | undefined;

        if (!label || !balloon.active) {
            return;
        }

        label.setPosition(balloon.x, balloon.y - 33 * balloon.scaleY);
        label.setAngle(balloon.angle * 0.2);
    }

    private handlePop(balloon: Phaser.Physics.Arcade.Sprite): void {
        if (this.finished || !balloon.active) {
            return;
        }

        const balloonData = balloon.getData('balloonData') as BalloonData;
        this.destroyLabel(balloon);
        this.playBurst(balloon.x, balloon.y, this.getBurstColor(balloonData.colorName));
        balloon.destroy();

        if (balloonData.isTarget) {
            this.popped += 1;
            this.score += 10 + Math.floor(this.level * 1.5);
            Sfx.playPop(1 + Math.min(this.level, 10) * 0.03);
            this.updateHud();

            if (this.popped >= this.getTargetCount()) {
                this.finishLevel();
            }

            return;
        }

        this.score = Math.max(0, this.score - 5);
        this.cameras.main.shake(90, 0.0035);
        Sfx.playSoftMistake();
        this.updateHud();
    }

    private handleEscape(balloon: Phaser.Physics.Arcade.Sprite): void {
        if (!balloon.active) {
            return;
        }

        const balloonData = balloon.getData('balloonData') as BalloonData;
        this.destroyLabel(balloon);
        balloon.destroy();

        if (!balloonData.isTarget || this.mode === 'red') {
            return;
        }

        this.score = Math.max(0, this.score - 2);
        Sfx.playSoftMistake(0.55);
        this.updateHud();
    }

    private destroyLabel(balloon: Phaser.Physics.Arcade.Sprite): void {
        const label = balloon.getData('label') as Phaser.GameObjects.Text | undefined;

        if (label) {
            label.destroy();
        }
    }

    private playBurst(x: number, y: number, color: number): void {
        for (let i = 0; i < 12; i += 1) {
            const dot = this.add.circle(x, y, Phaser.Math.Between(3, 6), color, 1).setDepth(80);
            const angle = (Math.PI * 2 * i) / 12;
            const distance = Phaser.Math.Between(24, 48);

            this.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.25,
                duration: 300,
                ease: 'Cubic.Out',
                onComplete: () => dot.destroy()
            });
        }
    }

    private getBurstColor(colorName: BalloonData['colorName']): number {
        if (colorName === 'red') {
            return 0xff5c8a;
        }

        if (colorName === 'yellow') {
            return 0xffd75e;
        }

        if (colorName === 'blue') {
            return 0x48d7ff;
        }

        return 0x55d982;
    }

    private getTargetCount(): number {
        return this.settings.targetCount + Math.floor((this.level - 1) * 1.6);
    }

    private getPaceMultiplier(): number {
        return 1 + Math.min(this.level - 1, 12) * 0.11;
    }

    private getRiseSpeed(): number {
        return Phaser.Math.Between(this.settings.minRiseSpeed, this.settings.maxRiseSpeed) * this.getPaceMultiplier();
    }

    private updateHud(): void {
        const target = this.getTargetCount();
        const progressWidth = 312 * Phaser.Math.Clamp(this.popped / target, 0, 1);

        this.levelText.setText(`LEVEL ${this.level}`);
        this.scoreText.setText(`SCORE ${this.score}`);
        this.taskText.setText(`${this.settings.instruction}  ${this.popped}/${target}`);
        this.progressBar.width = progressWidth;
        this.progressFrame.setStrokeStyle(5, 0x111111, 1);
    }

    private finishLevel(): void {
        if (this.finished) {
            return;
        }

        this.finished = true;
        const children = this.balloons.getChildren() as Phaser.Physics.Arcade.Sprite[];

        for (const balloon of children) {
            this.destroyLabel(balloon);
        }

        this.balloons.clear(true, true);
        Sfx.playSuccess();
        this.showLevelAdvance();

        this.time.delayedCall(1120, () => {
            this.scene.start('GameScene', {
                mode: this.mode,
                level: this.level + 1,
                score: this.score + 25
            });
        });
    }

    private showLevelAdvance(): void {
        const panel = this.add.rectangle(this.scale.width / 2 + 8, this.scale.height / 2 + 8, 500, 148, 0x111111, 1).setDepth(1000);
        const card = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 500, 148, 0xffffff, 0.94).setStrokeStyle(8, 0x111111, 1).setDepth(1001);
        const message = this.add
            .text(this.scale.width / 2, this.scale.height / 2, `Level ${this.level} clear!\nNext round: ${this.getTargetCount() + 2} pops`, {
                fontFamily: '"Titan One", cursive',
                fontSize: '36px',
                color: '#ff5c8a',
                stroke: '#111111',
                strokeThickness: 9,
                align: 'center'
            })
            .setOrigin(0.5)
            .setDepth(1002);

        this.tweens.add({
            targets: [panel, card, message],
            alpha: 0,
            delay: 820,
            duration: 260,
            ease: 'Quad.Out',
            onComplete: () => {
                panel.destroy();
                card.destroy();
                message.destroy();
            }
        });
    }
}
