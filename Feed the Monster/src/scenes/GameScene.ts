import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { FoodKind, GameMode, GameSummary, ModeSettings, MonsterAccessory, MonsterProfile } from '../types';

const FOOD_KINDS: Exclude<FoodKind, 'rock'>[] = ['apple', 'banana', 'cupcake', 'carrot'];
const MONSTERS: MonsterProfile[] = [
    {
        name: 'Munchy',
        bodyColor: 0x7bd35f,
        bellyColor: 0xfff0a6,
        hornColor: 0xff8d38,
        wantedFood: 'apple',
        targetMeals: 3,
        accessory: 'party-hat'
    },
    {
        name: 'Bibble',
        bodyColor: 0x8fdcff,
        bellyColor: 0xffffff,
        hornColor: 0xff4f8b,
        wantedFood: 'banana',
        targetMeals: 4,
        accessory: 'bow'
    },
    {
        name: 'Gumbo',
        bodyColor: 0xff9d52,
        bellyColor: 0xfff7d7,
        hornColor: 0x7bd35f,
        wantedFood: 'cupcake',
        targetMeals: 5,
        accessory: 'crown'
    }
];

const MODE_SETTINGS: Record<GameMode, ModeSettings> = {
    baby: {
        minFallSpeed: 62,
        maxFallSpeed: 104,
        minSpawnDelay: 1020,
        maxSpawnDelay: 1580,
        wrongFoodChance: 0.18,
        rockChance: 0,
        itemScale: 1.12
    },
    explorer: {
        minFallSpeed: 124,
        maxFallSpeed: 216,
        minSpawnDelay: 520,
        maxSpawnDelay: 860,
        wrongFoodChance: 0.38,
        rockChance: 0.2,
        itemScale: 0.96
    }
};

type FaceMood = 'happy' | 'open' | 'sad';

type FeedItem = Phaser.Physics.Arcade.Sprite & {
    input: Phaser.Types.Input.InteractiveObject;
};

export default class GameScene extends Phaser.Scene {
    private mode: GameMode = 'baby';
    private settings: ModeSettings = MODE_SETTINGS.baby;
    private levelIndex = 0;
    private monster = MONSTERS[0];
    private mealsFed = 0;
    private score = 0;
    private unlockedAccessories: MonsterAccessory[] = [];
    private finished = false;
    private fallingItems!: Phaser.Physics.Arcade.Group;
    private monsterBody!: Phaser.GameObjects.Graphics;
    private mouthZone = new Phaser.Geom.Rectangle();
    private wantedText!: Phaser.GameObjects.Text;
    private progressDots: Phaser.GameObjects.Arc[] = [];
    private scoreText?: Phaser.GameObjects.Text;
    private monsterContainer!: Phaser.GameObjects.Container;
    private mouthOpen = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: {
        mode?: GameMode;
        levelIndex?: number;
        score?: number;
        unlockedAccessories?: MonsterAccessory[];
    }): void {
        this.mode = data.mode === 'explorer' ? 'explorer' : 'baby';
        this.levelIndex = Phaser.Math.Clamp(data.levelIndex ?? 0, 0, MONSTERS.length - 1);
        this.monster = MONSTERS[this.levelIndex];
        this.settings = MODE_SETTINGS[this.mode];
        this.mealsFed = 0;
        this.score = data.score ?? 0;
        this.unlockedAccessories = data.unlockedAccessories ?? [];
        this.finished = false;
        this.progressDots = [];
        this.mouthOpen = false;
    }

    create(): void {
        this.drawBackground();
        this.createMonster();
        this.createHud();

        this.fallingItems = this.physics.add.group();
        this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            const item = gameObject as FeedItem;
            item.setVelocity(0, 0);
            item.setDepth(80);
            this.setMouthOpen(true);
        });
        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
            gameObject.setPosition(dragX, dragY);
        });
        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            const item = gameObject as FeedItem;
            this.setMouthOpen(false);
            this.tryFeed(item);
        });

        Sfx.unlock();
        this.input.on('pointerdown', () => Sfx.unlock());
        this.spawnLoop();
    }

    update(): void {
        if (this.finished) {
            return;
        }

        const children = this.fallingItems.getChildren() as Phaser.Physics.Arcade.Sprite[];

        for (const item of children) {
            if (!item.active) {
                continue;
            }

            if (item.y > this.scale.height + 58) {
                item.destroy();
            }
        }
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0xfff7d7);
        this.add.rectangle(width / 2, height - 48, width, 130, 0x7bd35f);
        this.add.rectangle(width / 2, height - 116, width, 12, 0x141414);

        const backdrop = this.add.graphics();
        backdrop.lineStyle(7, 0x141414, 1);
        backdrop.fillStyle(0xffffff, 1);
        backdrop.fillEllipse(width * 0.18, 94, 202, 70);
        backdrop.strokeEllipse(width * 0.18, 94, 202, 70);
        backdrop.fillEllipse(width * 0.78, 108, 230, 78);
        backdrop.strokeEllipse(width * 0.78, 108, 230, 78);
        backdrop.fillStyle(0xffd155, 1);
        backdrop.fillRoundedRect(32, height - 190, 84, 88, 20);
        backdrop.strokeRoundedRect(32, height - 190, 84, 88, 20);
        backdrop.fillStyle(0x8fdcff, 1);
        backdrop.fillRoundedRect(width - 120, height - 178, 88, 76, 20);
        backdrop.strokeRoundedRect(width - 120, height - 178, 88, 76, 20);
    }

    private createMonster(): void {
        this.monsterContainer = this.add.container(this.scale.width / 2, this.scale.height - 154);
        this.monsterBody = this.add.graphics();
        this.monsterContainer.add(this.monsterBody);
        this.redrawMonster('happy');
        this.mouthZone = new Phaser.Geom.Rectangle(this.scale.width / 2 - 74, this.scale.height - 196, 148, 76);

        this.tweens.add({
            targets: this.monsterContainer,
            y: this.scale.height - 160,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });
    }

    private createHud(): void {
        this.wantedText = this.add
            .text(this.scale.width / 2, 18, this.getWantedLabel(), {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '34px',
                color: '#ff4f8b',
                stroke: '#141414',
                strokeThickness: 9,
                shadow: { offsetX: 4, offsetY: 4, color: '#141414', fill: true }
            })
            .setOrigin(0.5, 0);

        const dotGap = 38;
        const firstDotX = this.scale.width / 2 - ((this.monster.targetMeals - 1) * dotGap) / 2;

        for (let i = 0; i < this.monster.targetMeals; i += 1) {
            this.add.circle(firstDotX + i * dotGap + 4, 76, 12, 0x141414, 1);
            const dot = this.add.circle(firstDotX + i * dotGap, 72, 12, 0xffffff, 1);
            dot.setStrokeStyle(4, 0x141414, 1);
            this.progressDots.push(dot);
        }

        this.add
            .text(this.scale.width - 24, 18, this.mode === 'baby' ? 'Baby' : 'Explorer', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#141414',
                strokeThickness: 8
            })
            .setOrigin(1, 0);

        if (this.mode === 'explorer') {
            this.scoreText = this.add.text(24, 18, 'SCORE 0', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '30px',
                color: '#ffd155',
                stroke: '#141414',
                strokeThickness: 8
            });
        }

        const homeBtn = this.add
            .text(this.scale.width - 24, this.scale.height - 18, 'HOME', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '28px',
                color: '#ff4f8b',
                stroke: '#141414',
                strokeThickness: 8
            })
            .setOrigin(1, 1)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MenuScene'));

        homeBtn.on('pointerover', () => homeBtn.setScale(1.1));
        homeBtn.on('pointerout', () => homeBtn.setScale(1));
        this.updateHud();
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

        this.time.delayedCall(Math.max(240, delay), () => this.spawnLoop());
    }

    private spawnObject(): void {
        const kind = this.pickItemKind();
        const item = this.fallingItems.create(
            Phaser.Math.Between(72, this.scale.width - 72),
            -48,
            `food-${kind}`
        ) as FeedItem;

        item.setActive(true);
        item.setVisible(true);
        item.setScale(this.settings.itemScale);
        item.setData('kind', kind);
        item.setInteractive({ useHandCursor: true, draggable: true });
        item.setAngularVelocity(Phaser.Math.Between(-80, 80));
        item.setVelocity(Phaser.Math.Between(-18, 18), Phaser.Math.Between(this.settings.minFallSpeed, this.settings.maxFallSpeed) * this.getPaceMultiplier());
        item.setDepth(30);
        this.input.setDraggable(item);
        item.on('pointerdown', () => this.tossToMouth(item));
    }

    private pickItemKind(): FoodKind {
        if (this.mode === 'explorer' && Math.random() < this.settings.rockChance) {
            return 'rock';
        }

        if (Math.random() > this.settings.wrongFoodChance) {
            return this.monster.wantedFood;
        }

        const wrongFoods = FOOD_KINDS.filter((food) => food !== this.monster.wantedFood);
        return Phaser.Utils.Array.GetRandom(wrongFoods);
    }

    private tossToMouth(item: FeedItem): void {
        if (this.finished || !item.active || item.input?.dragState > 0) {
            return;
        }

        item.setVelocity(0, 0);
        item.disableInteractive();
        item.setDepth(90);
        this.setMouthOpen(true);
        this.tweens.add({
            targets: item,
            x: this.mouthZone.centerX,
            y: this.mouthZone.centerY,
            scale: this.settings.itemScale * 0.62,
            angle: item.angle + 160,
            duration: 250,
            ease: 'Back.In',
            onComplete: () => {
                this.setMouthOpen(false);
                this.tryFeed(item, true);
            }
        });
    }

    private tryFeed(item: FeedItem, forceFeed = false): void {
        if (this.finished || !item.active) {
            return;
        }

        if (!forceFeed && !Phaser.Geom.Rectangle.Contains(this.mouthZone, item.x, item.y)) {
            const body = item.body as Phaser.Physics.Arcade.Body;
            body.setEnable(true);
            item.setVelocity(Phaser.Math.Between(-12, 12), this.settings.maxFallSpeed);
            item.setDepth(30);
            return;
        }

        const kind = item.getData('kind') as FoodKind;
        item.destroy();

        if (kind === this.monster.wantedFood) {
            this.handleGoodFood();
            return;
        }

        this.handleBadFood(kind);
    }

    private handleGoodFood(): void {
        this.mealsFed += 1;
        this.score += this.mode === 'explorer' ? 2 : 1;
        this.playBurst(this.mouthZone.centerX, this.mouthZone.centerY, 0xffd155);
        this.chompAnimation();
        Sfx.playChomp();
        this.updateHud();

        if (this.mealsFed >= this.monster.targetMeals) {
            this.finishRound();
        }
    }

    private handleBadFood(kind: FoodKind): void {
        if (this.mode === 'explorer') {
            this.score = Math.max(0, this.score - (kind === 'rock' ? 2 : 1));
        }

        this.redrawMonster('sad');
        this.cameras.main.shake(110, 0.003);
        this.playBurst(this.mouthZone.centerX, this.mouthZone.centerY, kind === 'rock' ? 0x8b8f9b : 0x8fdcff);
        Sfx.playSoftMistake(kind === 'rock' ? 1 : 0.75);
        this.time.delayedCall(420, () => this.redrawMonster('happy'));
        this.updateHud();
    }

    private chompAnimation(): void {
        this.redrawMonster('open');
        this.tweens.add({
            targets: this.monsterContainer,
            scaleX: 1.08,
            scaleY: 0.92,
            duration: 90,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.InOut',
            onComplete: () => this.redrawMonster('happy')
        });
    }

    private setMouthOpen(open: boolean): void {
        if (this.mouthOpen === open) {
            return;
        }

        this.mouthOpen = open;
        this.redrawMonster(open ? 'open' : 'happy');
    }

    private redrawMonster(mood: FaceMood): void {
        const g = this.monsterBody;
        g.clear();
        g.fillStyle(0x141414, 1);
        g.fillEllipse(12, 96, 260, 46);
        g.lineStyle(7, 0x141414, 1);
        g.fillStyle(this.monster.hornColor, 1);
        g.fillTriangle(-82, -98, -46, -144, -28, -88);
        g.strokeTriangle(-82, -98, -46, -144, -28, -88);
        g.fillTriangle(32, -90, 72, -146, 86, -84);
        g.strokeTriangle(32, -90, 72, -146, 86, -84);
        g.fillStyle(this.monster.bodyColor, 1);
        g.fillEllipse(0, 0, 230, 216);
        g.strokeEllipse(0, 0, 230, 216);
        g.fillStyle(this.monster.bellyColor, 1);
        g.fillEllipse(0, 43, 136, 94);
        g.strokeEllipse(0, 43, 136, 94);

        this.drawAccessory(g);

        g.fillStyle(0xffffff, 1);
        g.fillCircle(-44, -42, 25);
        g.fillCircle(44, -42, 25);
        g.strokeCircle(-44, -42, 25);
        g.strokeCircle(44, -42, 25);
        g.fillStyle(0x141414, 1);
        const pupilOffset = mood === 'sad' ? 4 : 0;
        g.fillCircle(-35, -37 + pupilOffset, 8);
        g.fillCircle(35, -37 + pupilOffset, 8);

        if (mood === 'open') {
            g.fillRoundedRect(-60, 0, 120, 56, 26);
            g.fillStyle(0xff8dcb, 1);
            g.fillEllipse(0, 39, 56, 20);
        } else if (mood === 'sad') {
            g.lineStyle(8, 0x141414, 1);
            g.beginPath();
            g.arc(0, 35, 36, Phaser.Math.DegToRad(205), Phaser.Math.DegToRad(335), false);
            g.strokePath();
        } else {
            g.fillRoundedRect(-54, 8, 108, 34, 17);
            g.fillStyle(0xffffff, 1);
            g.fillTriangle(-30, 10, -14, 10, -22, 24);
            g.fillTriangle(14, 10, 31, 10, 23, 24);
        }
    }

    private drawAccessory(g: Phaser.GameObjects.Graphics): void {
        const visibleAccessories = this.unlockedAccessories.includes(this.monster.accessory)
            ? this.unlockedAccessories
            : this.unlockedAccessories.filter((accessory) => accessory !== this.monster.accessory);
        const accessory = visibleAccessories[visibleAccessories.length - 1];

        if (accessory === 'party-hat') {
            g.fillStyle(0xff4f8b, 1);
            g.lineStyle(6, 0x141414, 1);
            g.fillTriangle(-26, -104, 6, -174, 38, -104);
            g.strokeTriangle(-26, -104, 6, -174, 38, -104);
            g.fillStyle(0xffd155, 1);
            g.fillCircle(6, -174, 9);
            g.strokeCircle(6, -174, 9);
        }

        if (accessory === 'bow') {
            g.fillStyle(0xff4f8b, 1);
            g.lineStyle(6, 0x141414, 1);
            g.fillTriangle(-48, -102, -10, -126, -8, -92);
            g.strokeTriangle(-48, -102, -10, -126, -8, -92);
            g.fillTriangle(48, -102, 10, -126, 8, -92);
            g.strokeTriangle(48, -102, 10, -126, 8, -92);
            g.fillCircle(0, -106, 12);
            g.strokeCircle(0, -106, 12);
        }

        if (accessory === 'crown') {
            g.fillStyle(0xffd155, 1);
            g.lineStyle(6, 0x141414, 1);
            g.fillTriangle(-48, -104, -34, -154, -16, -104);
            g.fillTriangle(-16, -104, 0, -166, 18, -104);
            g.fillTriangle(18, -104, 36, -154, 52, -104);
            g.fillRoundedRect(-52, -116, 104, 32, 8);
            g.strokeRoundedRect(-52, -116, 104, 32, 8);
        }
    }

    private playBurst(x: number, y: number, color: number): void {
        for (let i = 0; i < 10; i += 1) {
            const dot = this.add.circle(x, y, 4, color, 1);
            const angle = (Math.PI * 2 * i) / 10;
            const distance = Phaser.Math.Between(22, 42);

            this.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 280,
                ease: 'Cubic.Out',
                onComplete: () => dot.destroy()
            });
        }
    }

    private getPaceMultiplier(): number {
        const progress = Phaser.Math.Clamp(this.mealsFed / this.monster.targetMeals, 0, 1);
        const maxBoost = this.mode === 'baby' ? 1.12 : 1.5;
        return Phaser.Math.Linear(1, maxBoost, progress);
    }

    private updateHud(): void {
        this.progressDots.forEach((dot, index) => {
            dot.setFillStyle(index < this.mealsFed ? 0xffd155 : 0xffffff, 1);
            dot.setStrokeStyle(4, 0x141414, 1);
        });

        this.wantedText.setText(this.getWantedLabel());

        if (this.scoreText) {
            this.scoreText.setText(`SCORE ${this.score}`);
        }
    }

    private finishRound(): void {
        if (this.finished) {
            return;
        }

        this.finished = true;
        this.fallingItems.clear(true, true);
        Sfx.playSuccess();

        const unlockedAccessories = Array.from(new Set([...this.unlockedAccessories, this.monster.accessory]));
        this.showUnlock(this.monster.accessory);

        const nextLevelIndex = this.levelIndex + 1;
        if (nextLevelIndex < MONSTERS.length) {
            this.time.delayedCall(1250, () => {
                this.scene.start('GameScene', {
                    mode: this.mode,
                    levelIndex: nextLevelIndex,
                    score: this.score,
                    unlockedAccessories
                });
            });
            return;
        }

        const summary: GameSummary = {
            mode: this.mode,
            mealsFed: this.mealsFed,
            score: this.score,
            unlockedAccessories
        };

        this.time.delayedCall(1250, () => this.scene.start('CelebrationScene', summary));
    }

    private showUnlock(accessory: MonsterAccessory): void {
        const label = accessory === 'party-hat' ? 'Party hat unlocked!' : accessory === 'bow' ? 'Bow unlocked!' : 'Crown unlocked!';
        const panel = this.add.rectangle(this.scale.width / 2 + 8, this.scale.height / 2 + 8, 460, 108, 0x141414, 1);
        const card = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 460, 108, 0xffffff, 0.94).setStrokeStyle(6, 0x141414, 1);
        const text = this.add
            .text(this.scale.width / 2, this.scale.height / 2, label, {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '38px',
                color: '#ff4f8b',
                stroke: '#141414',
                strokeThickness: 8
            })
            .setOrigin(0.5);

        panel.setDepth(120);
        card.setDepth(121);
        text.setDepth(122);
        this.tweens.add({
            targets: [panel, card, text],
            y: '-=18',
            alpha: 0,
            delay: 720,
            duration: 380,
            ease: 'Sine.In',
            onComplete: () => {
                panel.destroy();
                card.destroy();
                text.destroy();
            }
        });
    }

    private getWantedLabel(): string {
        return `${this.monster.name} wants ${this.monster.wantedFood}s`;
    }
}
