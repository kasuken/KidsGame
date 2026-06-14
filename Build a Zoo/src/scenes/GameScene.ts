import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { AnimalProfile, GameMode, GameSummary, HabitatKey, HabitatProfile } from '../types';

const HABITATS: HabitatProfile[] = [
    { key: 'ice', name: 'Ice Area', label: 'ICE', color: 0xbff3ff, accent: 0xffffff },
    { key: 'savanna', name: 'Savanna', label: 'SUN', color: 0xffc76b, accent: 0xf27d3d },
    { key: 'aquarium', name: 'Aquarium', label: 'WATER', color: 0x58d6ff, accent: 0x176bc2 },
    { key: 'forest', name: 'Forest', label: 'TREES', color: 0x86d96a, accent: 0x2f8b4b }
];

const ANIMALS: AnimalProfile[] = [
    { name: 'Penguin', emoji: '🐧', habitat: 'ice', clue: 'likes chilly ice' },
    { name: 'Polar Bear', emoji: '🐻‍❄️', habitat: 'ice', clue: 'needs snow and ice' },
    { name: 'Seal', emoji: '🦭', habitat: 'ice', clue: 'rests on cold floes' },
    { name: 'Lion', emoji: '🦁', habitat: 'savanna', clue: 'roars in tall grass' },
    { name: 'Giraffe', emoji: '🦒', habitat: 'savanna', clue: 'stretches over the plains' },
    { name: 'Elephant', emoji: '🐘', habitat: 'savanna', clue: 'stomps across warm land' },
    { name: 'Fish', emoji: '🐠', habitat: 'aquarium', clue: 'swims in water' },
    { name: 'Octopus', emoji: '🐙', habitat: 'aquarium', clue: 'floats under bubbles' },
    { name: 'Turtle', emoji: '🐢', habitat: 'aquarium', clue: 'paddles by the glass' },
    { name: 'Monkey', emoji: '🐒', habitat: 'forest', clue: 'swings through trees' }
];

type AnimalToken = Phaser.GameObjects.Container & {
    startX: number;
    startY: number;
    animal: AnimalProfile;
};

export default class GameScene extends Phaser.Scene {
    private mode: GameMode = 'little';
    private deck: AnimalProfile[] = [];
    private habitatZones = new Map<HabitatKey, Phaser.Geom.Rectangle>();
    private habitatCounts = new Map<HabitatKey, number>();
    private currentToken?: AnimalToken;
    private promptText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private progressText!: Phaser.GameObjects.Text;
    private placed = 0;
    private score = 0;
    private targetCount = 6;
    private finished = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { mode?: GameMode }): void {
        this.mode = data.mode === 'big' ? 'big' : 'little';
        this.targetCount = this.mode === 'big' ? 10 : 6;
        this.deck = this.makeDeck(this.targetCount);
        this.habitatZones.clear();
        this.habitatCounts.clear();
        this.placed = 0;
        this.score = 0;
        this.finished = false;
        this.currentToken = undefined;
    }

    create(): void {
        this.drawBackground();
        this.createHabitats();
        this.createHud();
        this.setupDragHandlers();
        Sfx.unlock();
        this.input.on('pointerdown', () => Sfx.unlock());
        this.time.delayedCall(260, () => this.showNextAnimal());
    }

    private makeDeck(count: number): AnimalProfile[] {
        return Phaser.Utils.Array.Shuffle([...ANIMALS]).slice(0, count);
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0xfff1c9);
        this.add.rectangle(width / 2, height - 35, width, 88, 0x8bd36f);
        this.add.rectangle(width / 2, height - 80, width, 9, 0x22322d);

        const trail = this.add.graphics();
        trail.lineStyle(34, 0xe8b365, 1);
        trail.beginPath();
        trail.moveTo(80, height - 68);
        trail.bezierCurveTo(240, 382, 460, 456, width - 96, 326);
        trail.strokePath();
        trail.lineStyle(7, 0x22322d, 1);
        trail.strokePath();

        this.add.circle(58, 62, 34, 0xffd66b).setStrokeStyle(7, 0x22322d, 1);
    }

    private createHabitats(): void {
        const positions = [
            { x: 236, y: 176 },
            { x: 724, y: 176 },
            { x: 236, y: 390 },
            { x: 724, y: 390 }
        ];

        HABITATS.forEach((habitat, index) => {
            const pos = positions[index];
            this.drawHabitat(pos.x, pos.y, 328, 150, habitat);
            this.habitatZones.set(habitat.key, new Phaser.Geom.Rectangle(pos.x - 164, pos.y - 75, 328, 150));
            this.habitatCounts.set(habitat.key, 0);
        });
    }

    private drawHabitat(x: number, y: number, width: number, height: number, habitat: HabitatProfile): void {
        this.add.rectangle(x + 9, y + 9, width, height, 0x22322d, 1);
        this.add.rectangle(x, y, width, height, habitat.color, 1).setStrokeStyle(8, 0x22322d, 1);

        const art = this.add.graphics();
        art.lineStyle(5, 0x22322d, 1);
        art.fillStyle(habitat.accent, 0.8);

        if (habitat.key === 'ice') {
            art.fillTriangle(x - 126, y + 46, x - 78, y - 30, x - 22, y + 46);
            art.strokeTriangle(x - 126, y + 46, x - 78, y - 30, x - 22, y + 46);
            art.fillTriangle(x + 18, y + 46, x + 82, y - 42, x + 134, y + 46);
            art.strokeTriangle(x + 18, y + 46, x + 82, y - 42, x + 134, y + 46);
        } else if (habitat.key === 'savanna') {
            art.fillCircle(x - 106, y - 36, 26);
            art.strokeCircle(x - 106, y - 36, 26);
            art.fillRect(x + 36, y + 12, 96, 28);
            art.strokeRect(x + 36, y + 12, 96, 28);
        } else if (habitat.key === 'aquarium') {
            for (let i = 0; i < 4; i += 1) {
                art.fillCircle(x - 118 + i * 76, y - 22 + (i % 2) * 34, 13);
                art.strokeCircle(x - 118 + i * 76, y - 22 + (i % 2) * 34, 13);
            }
        } else {
            art.fillTriangle(x - 104, y + 42, x - 72, y - 46, x - 40, y + 42);
            art.fillTriangle(x + 48, y + 42, x + 86, y - 52, x + 124, y + 42);
            art.strokeTriangle(x - 104, y + 42, x - 72, y - 46, x - 40, y + 42);
            art.strokeTriangle(x + 48, y + 42, x + 86, y - 52, x + 124, y + 42);
        }

        this.add.text(x - width / 2 + 18, y - height / 2 + 14, habitat.name, {
            fontFamily: '"Titan One", cursive',
            fontSize: '27px',
            color: '#ffffff',
            stroke: '#22322d',
            strokeThickness: 7
        });
        this.add.text(x + width / 2 - 18, y + height / 2 - 20, habitat.label, {
            fontFamily: '"Nunito", sans-serif',
            fontSize: '18px',
            fontWeight: '900',
            color: '#22322d'
        }).setOrigin(1, 1);
    }

    private createHud(): void {
        this.promptText = this.add.text(this.scale.width / 2, 18, 'Who is arriving?', {
            fontFamily: '"Titan One", cursive',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#22322d',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#22322d', fill: true }
        }).setOrigin(0.5, 0).setDepth(50);

        this.scoreText = this.add.text(22, 18, 'SCORE 0', {
            fontFamily: '"Titan One", cursive',
            fontSize: '29px',
            color: '#ffd66b',
            stroke: '#22322d',
            strokeThickness: 8
        }).setDepth(50);

        this.progressText = this.add.text(this.scale.width - 22, 18, `0/${this.targetCount}`, {
            fontFamily: '"Titan One", cursive',
            fontSize: '29px',
            color: '#74d6b7',
            stroke: '#22322d',
            strokeThickness: 8
        }).setOrigin(1, 0).setDepth(50);

        const homeBtn = this.add.text(this.scale.width - 22, this.scale.height - 18, 'HOME', {
            fontFamily: '"Titan One", cursive',
            fontSize: '25px',
            color: '#ffffff',
            stroke: '#22322d',
            strokeThickness: 7
        }).setOrigin(1, 1).setDepth(60).setInteractive({ useHandCursor: true });
        homeBtn.on('pointerdown', () => this.scene.start('MenuScene'));
        homeBtn.on('pointerover', () => homeBtn.setScale(1.1));
        homeBtn.on('pointerout', () => homeBtn.setScale(1));
    }

    private setupDragHandlers(): void {
        this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            const token = gameObject as AnimalToken;
            token.setScale(1.08);
            token.setDepth(100);
        });

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
            gameObject.setPosition(dragX, dragY);
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            this.handleDrop(gameObject as AnimalToken);
        });
    }

    private showNextAnimal(): void {
        if (this.finished) {
            return;
        }

        const animal = this.deck.shift();
        if (!animal) {
            this.finishGame();
            return;
        }

        this.promptText.setText(`${animal.name}: ${animal.clue}`);
        this.currentToken = this.createAnimalToken(this.scale.width / 2, this.scale.height / 2 + 8, animal);
    }

    private createAnimalToken(x: number, y: number, animal: AnimalProfile): AnimalToken {
        const shadow = this.add.rectangle(8, 10, 182, 138, 0x22322d, 1);
        const card = this.add.rectangle(0, 0, 182, 138, 0xffffff, 1).setStrokeStyle(8, 0x22322d, 1);
        const emoji = this.add.text(0, -18, animal.emoji, { fontSize: '62px' }).setOrigin(0.5);
        const label = this.add.text(0, 45, animal.name, {
            fontFamily: '"Nunito", sans-serif',
            fontSize: '21px',
            fontWeight: '900',
            color: '#22322d'
        }).setOrigin(0.5);
        const token = this.add.container(x, y, [shadow, card, emoji, label]) as AnimalToken;
        token.setSize(182, 138);
        token.startX = x;
        token.startY = y;
        token.animal = animal;
        token.setInteractive({ useHandCursor: true, draggable: true });
        this.input.setDraggable(token);

        token.setScale(0.1);
        this.tweens.add({ targets: token, scale: 1, duration: 260, ease: 'Back.Out' });
        return token;
    }

    private handleDrop(token: AnimalToken): void {
        const habitat = this.getHabitatAt(token.x, token.y);
        if (habitat === token.animal.habitat) {
            this.placeAnimal(token, habitat);
            return;
        }

        Sfx.playSoftMistake(0.65);
        this.promptText.setText(`${token.animal.name} needs ${this.getHabitatName(token.animal.habitat)}!`);
        token.setScale(1);
        this.tweens.add({ targets: token, x: token.startX, y: token.startY, duration: 280, ease: 'Back.Out' });
        this.cameras.main.shake(110, 0.004);
    }

    private getHabitatAt(x: number, y: number): HabitatKey | undefined {
        for (const [key, zone] of this.habitatZones.entries()) {
            if (Phaser.Geom.Rectangle.Contains(zone, x, y)) {
                return key;
            }
        }
        return undefined;
    }

    private placeAnimal(token: AnimalToken, habitat: HabitatKey): void {
        token.disableInteractive();
        Sfx.playPop(1.12);
        this.placed += 1;
        this.score += 10;
        const count = this.habitatCounts.get(habitat) ?? 0;
        this.habitatCounts.set(habitat, count + 1);
        this.scoreText.setText(`SCORE ${this.score}`);
        this.progressText.setText(`${this.placed}/${this.targetCount}`);
        this.promptText.setText(`Great! ${token.animal.name} is home.`);

        const zone = this.habitatZones.get(habitat)!;
        const row = Math.floor(count / 3);
        const column = count % 3;
        const targetX = zone.x + 70 + column * 70;
        const targetY = zone.y + 92 + row * 30;
        this.tweens.add({
            targets: token,
            x: targetX,
            y: targetY,
            scale: 0.48,
            duration: 300,
            ease: 'Back.Out',
            onComplete: () => {
                this.currentToken = undefined;
                this.time.delayedCall(360, () => this.showNextAnimal());
            }
        });
    }

    private getHabitatName(key: HabitatKey): string {
        return HABITATS.find((habitat) => habitat.key === key)?.name ?? 'a habitat';
    }

    private finishGame(): void {
        this.finished = true;
        const summary: GameSummary = {
            mode: this.mode,
            placed: this.placed,
            score: this.score
        };
        this.time.delayedCall(500, () => this.scene.start('CelebrationScene', summary));
    }
}
