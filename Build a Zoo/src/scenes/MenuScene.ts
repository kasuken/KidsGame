import * as Phaser from 'phaser';
import { Sfx } from '../game/sfx';
import { GameMode } from '../types';

const MODES: Array<{ mode: GameMode; title: string; subtitle: string; color: number }> = [
    { mode: 'little', title: 'Little Zoo', subtitle: '6 animals, big clues', color: 0xffd66b },
    { mode: 'big', title: 'Big Zoo', subtitle: '10 animals, more habitats', color: 0x74d6b7 }
];

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const { width, height } = this.scale;

        this.drawBackground();

        this.add
            .text(width / 2, 84, 'Build a Zoo', {
                fontFamily: '"Cherry Bomb One", "Titan One", cursive',
                fontSize: '82px',
                color: '#ffffff',
                stroke: '#22322d',
                strokeThickness: 16,
                shadow: { offsetX: 7, offsetY: 7, color: '#22322d', fill: true }
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 164, 'Put every animal where it feels at home', {
                fontFamily: '"Nunito", sans-serif',
                fontSize: '30px',
                fontWeight: '900',
                color: '#22322d'
            })
            .setOrigin(0.5);

        MODES.forEach((modeInfo, index) => {
            this.createModeButton(width / 2, 282 + index * 126, 430, 94, modeInfo);
        });

        this.add
            .text(width / 2, height - 28, 'Penguin → ice • Lion → savanna • Fish → aquarium', {
                fontFamily: '"Nunito", sans-serif',
                fontSize: '22px',
                fontWeight: '900',
                color: '#314a42'
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => Sfx.unlock());
    }

    private drawBackground(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0xfff1c9);
        this.add.rectangle(width / 2, height - 50, width, 118, 0x8bd36f);
        this.add.rectangle(width / 2, height - 108, width, 10, 0x22322d);

        const path = this.add.graphics();
        path.fillStyle(0xe8b365, 1);
        path.lineStyle(8, 0x22322d, 1);
        path.fillEllipse(width / 2, height - 28, 410, 128);
        path.strokeEllipse(width / 2, height - 28, 410, 128);

        this.add.circle(86, 82, 48, 0xffd66b).setStrokeStyle(8, 0x22322d, 1);
        this.add.text(118, 302, '🐧', { fontSize: '72px' }).setAngle(-9).setOrigin(0.5);
        this.add.text(width - 118, 296, '🦁', { fontSize: '78px' }).setAngle(8).setOrigin(0.5);
        this.add.text(width - 166, 150, '🐠', { fontSize: '64px' }).setAngle(-12).setOrigin(0.5);
    }

    private createModeButton(
        x: number,
        y: number,
        width: number,
        height: number,
        modeInfo: { mode: GameMode; title: string; subtitle: string; color: number }
    ): void {
        this.add.rectangle(x + 8, y + 8, width, height, 0x22322d);
        const panel = this.add.rectangle(x, y, width, height, modeInfo.color).setStrokeStyle(8, 0x22322d, 1);
        const title = this.add.text(x, y - 17, modeInfo.title, {
            fontFamily: '"Titan One", cursive',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#22322d',
            strokeThickness: 9
        }).setOrigin(0.5);
        const subtitle = this.add.text(x, y + 27, modeInfo.subtitle, {
            fontFamily: '"Nunito", sans-serif',
            fontSize: '21px',
            fontWeight: '900',
            color: '#22322d'
        }).setOrigin(0.5);
        const target = this.add.rectangle(x, y, width, height, 0x000000, 0.001).setInteractive({ useHandCursor: true });

        target.on('pointerover', () => [panel, title, subtitle].forEach((item) => item.setPosition(item.x - 5, item.y - 5)));
        target.on('pointerout', () => {
            panel.setPosition(x, y);
            title.setPosition(x, y - 17);
            subtitle.setPosition(x, y + 27);
        });
        target.on('pointerdown', () => {
            Sfx.playPop(1.05);
            this.cameras.main.flash(140, 255, 255, 255);
            this.time.delayedCall(130, () => this.scene.start('GameScene', { mode: modeInfo.mode }));
        });
    }
}
