import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { AnimalKind, AnimalProfile, GameMode, GameSummary, HabitatKind, HabitatProfile, ModeSettings } from '../types';

const HABITATS: HabitatProfile[] = [
    { kind: 'ice', name: 'Ice Area', hint: 'cold and snowy', color: 0xbff4ff, accent: 0xffffff, emoji: '❄️' },
    { kind: 'savanna', name: 'Savanna', hint: 'warm grassland', color: 0xffc85c, accent: 0xf0822f, emoji: '🌾' },
    { kind: 'aquarium', name: 'Aquarium', hint: 'splashy water', color: 0x56c7ff, accent: 0x1f73d1, emoji: '💧' },
    { kind: 'forest', name: 'Forest', hint: 'leafy trees', color: 0x72d575, accent: 0x279654, emoji: '🌿' },
    { kind: 'desert', name: 'Desert', hint: 'hot sand', color: 0xffdf7e, accent: 0xd98c2f, emoji: '☀️' }
];

const ANIMALS: Record<AnimalKind, AnimalProfile> = {
    penguin: { kind: 'penguin', name: 'Penguin', emoji: '🐧', habitat: 'ice', clue: 'Penguins waddle on ice.' },
    polarBear: { kind: 'polarBear', name: 'Polar Bear', emoji: '🐻‍❄️', habitat: 'ice', clue: 'Polar bears stay cool in icy places.' },
    seal: { kind: 'seal', name: 'Seal', emoji: '🦭', habitat: 'ice', clue: 'Seals rest on chilly icy shores.' },
    lion: { kind: 'lion', name: 'Lion', emoji: '🦁', habitat: 'savanna', clue: 'Lions prowl the savanna.' },
    zebra: { kind: 'zebra', name: 'Zebra', emoji: '🦓', habitat: 'savanna', clue: 'Zebras graze in warm grasslands.' },
    giraffe: { kind: 'giraffe', name: 'Giraffe', emoji: '🦒', habitat: 'savanna', clue: 'Giraffes stretch high over savanna trees.' },
    elephant: { kind: 'elephant', name: 'Elephant', emoji: '🐘', habitat: 'savanna', clue: 'Elephants roam open savanna plains.' },
    rhino: { kind: 'rhino', name: 'Rhino', emoji: '🦏', habitat: 'savanna', clue: 'Rhinos love sunny grassy habitats.' },
    hippo: { kind: 'hippo', name: 'Hippo', emoji: '🦛', habitat: 'savanna', clue: 'Hippos cool off in warm savanna waters.' },
    fish: { kind: 'fish', name: 'Fish', emoji: '🐟', habitat: 'aquarium', clue: 'Fish need water to swim.' },
    tropicalFish: { kind: 'tropicalFish', name: 'Tropical Fish', emoji: '🐠', habitat: 'aquarium', clue: 'Tropical fish sparkle in clear water.' },
    dolphin: { kind: 'dolphin', name: 'Dolphin', emoji: '🐬', habitat: 'aquarium', clue: 'Dolphins leap through ocean water.' },
    whale: { kind: 'whale', name: 'Whale', emoji: '🐳', habitat: 'aquarium', clue: 'Whales are giant animals of the sea.' },
    shark: { kind: 'shark', name: 'Shark', emoji: '🦈', habitat: 'aquarium', clue: 'Sharks swim in deep blue water.' },
    octopus: { kind: 'octopus', name: 'Octopus', emoji: '🐙', habitat: 'aquarium', clue: 'Octopuses hide and glide underwater.' },
    monkey: { kind: 'monkey', name: 'Monkey', emoji: '🐒', habitat: 'forest', clue: 'Monkeys swing in trees.' },
    koala: { kind: 'koala', name: 'Koala', emoji: '🐨', habitat: 'forest', clue: 'Koalas rest in leafy tree homes.' },
    deer: { kind: 'deer', name: 'Deer', emoji: '🦌', habitat: 'forest', clue: 'Deer tiptoe through forest paths.' },
    owl: { kind: 'owl', name: 'Owl', emoji: '🦉', habitat: 'forest', clue: 'Owls perch quietly in forest trees.' },
    fox: { kind: 'fox', name: 'Fox', emoji: '🦊', habitat: 'forest', clue: 'Foxes sneak through shady forests.' },
    bear: { kind: 'bear', name: 'Bear', emoji: '🐻', habitat: 'forest', clue: 'Bears wander deep forest woods.' },
    camel: { kind: 'camel', name: 'Camel', emoji: '🐪', habitat: 'desert', clue: 'Camels like sandy deserts.' },
    lizard: { kind: 'lizard', name: 'Lizard', emoji: '🦎', habitat: 'desert', clue: 'Lizards bask on warm desert rocks.' },
    snake: { kind: 'snake', name: 'Snake', emoji: '🐍', habitat: 'desert', clue: 'Snakes slither across hot sand.' },
    scorpion: { kind: 'scorpion', name: 'Scorpion', emoji: '🦂', habitat: 'desert', clue: 'Scorpions thrive in dry deserts.' }
};

const MODE_SETTINGS: Record<GameMode, ModeSettings> = {
    baby: {
        rounds: 6,
        thinkingTime: 0,
        hintDelay: 1200,
        decoyChance: 0
    },
    explorer: {
        rounds: 25,
        thinkingTime: 900,
        hintDelay: 2600,
        decoyChance: 0.22
    }
};

type AnimalToken = Phaser.GameObjects.Text & {
    input: Phaser.Types.Input.InteractiveObject;
};

interface HabitatCard {
    profile: HabitatProfile;
    bounds: Phaser.Geom.Rectangle;
    panel: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
    count: Phaser.GameObjects.Text;
}

export default class GameScene extends Phaser.Scene {
    private mode: GameMode = 'baby';
    private settings: ModeSettings = MODE_SETTINGS.baby;
    private habitats: HabitatCard[] = [];
    private currentAnimal?: AnimalToken;
    private currentProfile?: AnimalProfile;
    private promptText!: Phaser.GameObjects.Text;
    private roundText!: Phaser.GameObjects.Text;
    private scoreText?: Phaser.GameObjects.Text;
    private habitatCounts: Record<HabitatKind, number> = { ice: 0, savanna: 0, aquarium: 0, forest: 0, desert: 0 };
    private animalQueue: AnimalProfile[] = [];
    private round = 0;
    private placed = 0;
    private score = 0;
    private finished = false;
    private hintEvent?: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { mode?: GameMode }): void {
        this.mode = data.mode === 'explorer' ? 'explorer' : 'baby';
        this.settings = MODE_SETTINGS[this.mode];
        this.habitats = [];
        this.currentAnimal = undefined;
        this.currentProfile = undefined;
        this.habitatCounts = { ice: 0, savanna: 0, aquarium: 0, forest: 0, desert: 0 };
        this.animalQueue = this.createAnimalQueue();
        this.round = 0;
        this.placed = 0;
        this.score = 0;
        this.finished = false;
        this.hintEvent = undefined;
    }

    create(): void {
        this.drawBackground();
        this.createHabitats();
        this.createHud();
        this.setupDragControls();

        Sfx.unlock();
        this.input.on('pointerdown', () => Sfx.unlock());
        this.time.delayedCall(320, () => this.presentNextAnimal());
    }

    private createAnimalQueue(): AnimalProfile[] {
        const starter: AnimalKind[] = ['penguin', 'seal', 'lion', 'zebra', 'fish', 'dolphin'];
        const full: AnimalKind[] = [
            'penguin',
            'polarBear',
            'seal',
            'lion',
            'zebra',
            'giraffe',
            'elephant',
            'rhino',
            'hippo',
            'fish',
            'tropicalFish',
            'dolphin',
            'whale',
            'shark',
            'octopus',
            'monkey',
            'koala',
            'deer',
            'owl',
            'fox',
            'bear',
            'camel',
            'lizard',
            'snake',
            'scorpion'
        ];
        const pool = this.mode === 'baby' ? starter : full;
        const shuffled = Phaser.Utils.Array.Shuffle([...pool]);
        const queue: AnimalProfile[] = [];

        for (let i = 0; i < this.settings.rounds; i += 1) {
            queue.push(ANIMALS[shuffled[i % shuffled.length]]);
        }

        return queue;
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0xd8f6ff);
        this.add.rectangle(width / 2, height - 42, width, 126, 0x70d27b);
        this.add.rectangle(width / 2, height - 106, width, 12, 0x173329);

        const graphics = this.add.graphics();
        graphics.lineStyle(8, 0x173329, 1);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillEllipse(width * 0.15, 88, 210, 72);
        graphics.strokeEllipse(width * 0.15, 88, 210, 72);
        graphics.fillEllipse(width * 0.78, 104, 240, 78);
        graphics.strokeEllipse(width * 0.78, 104, 240, 78);
        graphics.fillStyle(0xffd766, 1);
        graphics.fillCircle(width * 0.5, 74, 38);
        graphics.strokeCircle(width * 0.5, 74, 38);

        this.add.text(62, height - 170, '🚌', { fontSize: '58px' }).setOrigin(0.5).setAngle(-4);
        this.add.text(width - 74, height - 170, '🎟️', { fontSize: '52px' }).setOrigin(0.5).setAngle(12);
    }

    private createHud(): void {
        this.promptText = this.add
            .text(this.scale.width / 2, 20, 'The zoo gate is opening...', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '33px',
                color: '#fff0a8',
                stroke: '#173329',
                strokeThickness: 9,
                shadow: { offsetX: 4, offsetY: 4, color: '#173329', fill: true }
            })
            .setOrigin(0.5, 0)
            .setDepth(80);

        this.roundText = this.add
            .text(22, 20, '0/0', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '30px',
                color: '#ffffff',
                stroke: '#173329',
                strokeThickness: 8
            })
            .setDepth(80);

        this.add
            .text(this.scale.width - 24, 20, this.mode === 'baby' ? 'Baby' : 'Explorer', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#173329',
                strokeThickness: 8
            })
            .setOrigin(1, 0)
            .setDepth(80);

        if (this.mode === 'explorer') {
            this.scoreText = this.add
                .text(24, 62, 'SCORE 0', {
                    fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                    fontSize: '26px',
                    color: '#ffdf7e',
                    stroke: '#173329',
                    strokeThickness: 7
                })
                .setDepth(80);
        }

        const homeBtn = this.add
            .text(this.scale.width - 24, this.scale.height - 18, 'HOME', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '28px',
                color: '#ff7f7f',
                stroke: '#173329',
                strokeThickness: 8
            })
            .setOrigin(1, 1)
            .setDepth(90)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MenuScene'));

        homeBtn.on('pointerover', () => homeBtn.setScale(1.1));
        homeBtn.on('pointerout', () => homeBtn.setScale(1));
        this.updateHud();
    }

    private createHabitats(): void {
        const activeHabitats = this.mode === 'baby' ? HABITATS.slice(0, 3) : HABITATS;
        const cardWidth = this.mode === 'baby' ? 248 : 176;
        const cardHeight = 156;
        const gap = this.mode === 'baby' ? 38 : 14;
        const totalWidth = activeHabitats.length * cardWidth + (activeHabitats.length - 1) * gap;
        const startX = (this.scale.width - totalWidth) / 2 + cardWidth / 2;
        const y = this.scale.height - 176;

        activeHabitats.forEach((profile, index) => {
            const x = startX + index * (cardWidth + gap);
            this.add.rectangle(x + 8, y + 8, cardWidth, cardHeight, 0x173329, 1);
            const panel = this.add.rectangle(x, y, cardWidth, cardHeight, profile.color, 1).setStrokeStyle(7, 0x173329, 1);
            this.drawHabitatScene(profile, x, y, cardWidth, cardHeight);

            this.add.text(x, y - 34, profile.emoji, { fontSize: this.mode === 'baby' ? '46px' : '38px' }).setOrigin(0.5);
            const label = this.add
                .text(x, y + 28, profile.name, {
                    fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                    fontSize: this.mode === 'baby' ? '28px' : '22px',
                    color: '#ffffff',
                    stroke: '#173329',
                    strokeThickness: 7,
                    align: 'center'
                })
                .setOrigin(0.5);
            const count = this.add
                .text(x, y + 61, '0', {
                    fontFamily: '"Fredoka", sans-serif',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#173329'
                })
                .setOrigin(0.5);

            this.habitats.push({
                profile,
                bounds: new Phaser.Geom.Rectangle(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight),
                panel,
                label,
                count
            });
        });
    }

    private drawHabitatScene(profile: HabitatProfile, x: number, y: number, width: number, height: number): void {
        const g = this.add.graphics();
        g.lineStyle(5, 0x173329, 1);
        g.fillStyle(profile.accent, 0.55);

        if (profile.kind === 'ice') {
            g.fillTriangle(x - width * 0.42, y + height * 0.18, x - width * 0.24, y - height * 0.28, x - width * 0.05, y + height * 0.18);
            g.strokeTriangle(x - width * 0.42, y + height * 0.18, x - width * 0.24, y - height * 0.28, x - width * 0.05, y + height * 0.18);
            g.fillTriangle(x + width * 0.02, y + height * 0.18, x + width * 0.24, y - height * 0.32, x + width * 0.44, y + height * 0.18);
            g.strokeTriangle(x + width * 0.02, y + height * 0.18, x + width * 0.24, y - height * 0.32, x + width * 0.44, y + height * 0.18);
        }

        if (profile.kind === 'savanna') {
            for (let i = 0; i < 5; i += 1) {
                const bladeX = x - width * 0.36 + i * width * 0.18;
                g.fillTriangle(bladeX, y + height * 0.24, bladeX + 10, y - height * 0.2, bladeX + 22, y + height * 0.24);
                g.strokeTriangle(bladeX, y + height * 0.24, bladeX + 10, y - height * 0.2, bladeX + 22, y + height * 0.24);
            }
        }

        if (profile.kind === 'aquarium') {
            g.fillEllipse(x, y + 4, width * 0.78, height * 0.42);
            g.strokeEllipse(x, y + 4, width * 0.78, height * 0.42);
            g.fillStyle(0xffffff, 0.82);
            g.fillCircle(x - width * 0.2, y - height * 0.12, 9);
            g.fillCircle(x + width * 0.18, y - height * 0.04, 6);
        }

        if (profile.kind === 'forest') {
            g.fillCircle(x - width * 0.22, y - height * 0.12, 34);
            g.strokeCircle(x - width * 0.22, y - height * 0.12, 34);
            g.fillCircle(x + width * 0.24, y - height * 0.08, 38);
            g.strokeCircle(x + width * 0.24, y - height * 0.08, 38);
            g.fillStyle(0x7a4b2d, 1);
            g.fillRect(x - 8, y - 8, 16, 48);
        }

        if (profile.kind === 'desert') {
            g.fillCircle(x + width * 0.23, y - height * 0.22, 24);
            g.strokeCircle(x + width * 0.23, y - height * 0.22, 24);
            g.fillEllipse(x - width * 0.12, y + height * 0.18, width * 0.72, height * 0.28);
            g.strokeEllipse(x - width * 0.12, y + height * 0.18, width * 0.72, height * 0.28);
        }
    }

    private setupDragControls(): void {
        this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            const animal = gameObject as AnimalToken;
            animal.setDepth(120);
            animal.setScale(1.28);
            this.highlightHabitats(false);
        });

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
            gameObject.setPosition(dragX, dragY);
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            const animal = gameObject as AnimalToken;
            animal.setScale(1.18);
            this.tryPlaceAnimal(animal.x, animal.y);
        });
    }

    private presentNextAnimal(): void {
        if (this.finished) {
            return;
        }

        this.hintEvent?.remove(false);
        const profile = this.animalQueue[this.round];
        this.currentProfile = profile;
        this.round += 1;
        this.updateHud();
        this.promptText.setText(`${profile.name} arrived! Where does it live?`);

        const token = this.add
            .text(this.scale.width / 2, -52, profile.emoji, {
                fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                fontSize: '78px'
            })
            .setOrigin(0.5)
            .setDepth(110)
            .setInteractive({ useHandCursor: true, draggable: true }) as AnimalToken;

        this.input.setDraggable(token);
        token.on('pointerdown', () => this.showAnimalHint());
        this.currentAnimal = token;

        this.tweens.add({
            targets: token,
            y: 202,
            scale: 1.18,
            angle: Phaser.Math.Between(-6, 6),
            duration: 520,
            ease: 'Back.Out',
            onComplete: () => this.scheduleHint()
        });
    }

    private showAnimalHint(): void {
        if (!this.currentProfile) {
            return;
        }

        this.promptText.setText(this.currentProfile.clue);
        if (this.mode === 'baby') {
            this.highlightCorrectHabitat();
        }
    }

    private scheduleHint(): void {
        if (!this.currentProfile) {
            return;
        }

        this.hintEvent = this.time.delayedCall(this.settings.hintDelay, () => {
            if (!this.finished && this.currentAnimal?.active) {
                this.showAnimalHint();
            }
        });
    }

    private tryPlaceAnimal(x: number, y: number): void {
        if (!this.currentAnimal || !this.currentProfile) {
            return;
        }

        const target = this.habitats.find((habitat) => Phaser.Geom.Rectangle.Contains(habitat.bounds, x, y));

        if (!target) {
            this.returnAnimalToGate();
            return;
        }

        if (target.profile.kind === this.currentProfile.habitat) {
            this.placeAnimal(target);
            return;
        }

        this.handleWrongHabitat(target);
    }

    private placeAnimal(target: HabitatCard): void {
        if (!this.currentAnimal || !this.currentProfile) {
            return;
        }

        const animal = this.currentAnimal;
        const profile = this.currentProfile;
        animal.disableInteractive();
        this.hintEvent?.remove(false);
        this.placed += 1;
        this.score += this.mode === 'explorer' ? 3 : 1;
        this.habitatCounts[target.profile.kind] += 1;
        this.promptText.setText(`${profile.name} is home in the ${target.profile.name}!`);
        this.updateHud();
        this.playBurst(target.bounds.centerX, target.bounds.centerY, target.profile.accent);
        Sfx.playHappy();

        this.tweens.add({
            targets: animal,
            x: target.bounds.centerX,
            y: target.bounds.centerY - 24,
            scale: this.mode === 'baby' ? 0.72 : 0.58,
            angle: 0,
            duration: 260,
            ease: 'Back.Out',
            onComplete: () => {
                this.tweens.add({
                    targets: animal,
                    y: animal.y - 10,
                    duration: 420,
                    yoyo: true,
                    repeat: 1,
                    ease: 'Sine.InOut'
                });
                this.currentAnimal = undefined;
                this.currentProfile = undefined;
                this.time.delayedCall(720, () => this.continueOrFinish());
            }
        });
    }

    private handleWrongHabitat(target: HabitatCard): void {
        if (!this.currentProfile) {
            return;
        }

        if (this.mode === 'explorer') {
            this.score = Math.max(0, this.score - 1);
        }

        this.promptText.setText(`${this.currentProfile.name} needs a different home.`);
        target.panel.setFillStyle(0xff7f7f, 1);
        this.cameras.main.shake(110, 0.003);
        Sfx.playSoftMistake(0.72);
        this.tweens.add({
            targets: target.panel,
            x: target.panel.x + 8,
            duration: 55,
            yoyo: true,
            repeat: 3,
            onComplete: () => target.panel.setFillStyle(target.profile.color, 1)
        });
        this.updateHud();
        this.returnAnimalToGate();
    }

    private returnAnimalToGate(): void {
        if (!this.currentAnimal) {
            return;
        }

        this.tweens.add({
            targets: this.currentAnimal,
            x: this.scale.width / 2,
            y: 202,
            scale: 1.18,
            duration: 260,
            ease: 'Back.Out'
        });
    }

    private highlightCorrectHabitat(): void {
        if (!this.currentProfile) {
            return;
        }

        const habitat = this.habitats.find((item) => item.profile.kind === this.currentProfile?.habitat);
        if (!habitat) {
            return;
        }

        this.tweens.add({
            targets: [habitat.panel, habitat.label],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 180,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.InOut'
        });
    }

    private highlightHabitats(strong: boolean): void {
        this.habitats.forEach((habitat) => {
            habitat.panel.setStrokeStyle(strong ? 10 : 7, 0x173329, 1);
        });
    }

    private continueOrFinish(): void {
        if (this.placed >= this.settings.rounds) {
            this.finishGame();
            return;
        }

        this.presentNextAnimal();
    }

    private finishGame(): void {
        if (this.finished) {
            return;
        }

        this.finished = true;
        Sfx.playSuccess();
        const summary: GameSummary = {
            mode: this.mode,
            animalsPlaced: this.placed,
            score: this.score
        };
        this.time.delayedCall(950, () => this.scene.start('CelebrationScene', summary));
    }

    private playBurst(x: number, y: number, color: number): void {
        for (let i = 0; i < 12; i += 1) {
            const dot = this.add.circle(x, y, 5, i % 2 === 0 ? color : 0xfff0a8, 1).setDepth(130);
            const angle = (Math.PI * 2 * i) / 12;
            const distance = Phaser.Math.Between(24, 54);

            this.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 340,
                ease: 'Cubic.Out',
                onComplete: () => dot.destroy()
            });
        }
    }

    private updateHud(): void {
        if (this.roundText) {
            this.roundText.setText(`${Math.min(this.round, this.settings.rounds)}/${this.settings.rounds}`);
        }

        if (this.scoreText) {
            this.scoreText.setText(`SCORE ${this.score}`);
        }

        this.habitats.forEach((habitat) => {
            habitat.count.setText(`${this.habitatCounts[habitat.profile.kind]}`);
        });
    }
}
