export type Flower = 'bloom' | 'mint' | 'sun';
export type Power = 'rainbow' | 'freeze';
export type Point = { x: number; y: number };
export type Tower = { kind: Flower; pad: number; cooldown: number };
export type Snail = Point & { id: number; distance: number; hp: number; maxHp: number; speed: number; slow: number; variant: number };
export type Spark = { from: Point; to: Point; kind: Flower | Power; life: number };

export const FLOWERS = {
  bloom: { name: 'Bubble bloom', icon: '✿', cost: 40, range: 230, damage: 1, interval: 0.85, unlock: 0, color: '#f07ba0' },
  mint: { name: 'Chilly mint', icon: '❄', cost: 50, range: 215, damage: 0.7, interval: 1.1, unlock: 1, color: '#82d3da' },
  sun: { name: 'Sunny burst', icon: '☀', cost: 65, range: 260, damage: 2.5, interval: 1.5, unlock: 2, color: '#ffc857' },
};

export const LEVELS = [
  { name: 'Sunny beginnings', waves: 2, count: 4, hp: 2, speed: 40, coins: 140, gap: 3.2, color: '#dbeabd' },
  { name: 'The minty meadow', waves: 2, count: 6, hp: 3, speed: 44, coins: 150, gap: 2.8, color: '#d4e8c5' },
  { name: 'Sunflower picnic', waves: 3, count: 7, hp: 4, speed: 47, coins: 160, gap: 2.6, color: '#e5e8b5' },
  { name: 'Butterfly bend', waves: 3, count: 8, hp: 5, speed: 50, coins: 175, gap: 2.3, color: '#dce5c1' },
  { name: 'Twilight visitors', waves: 3, count: 9, hp: 6, speed: 53, coins: 190, gap: 2.1, color: '#d5dfcb' },
  { name: 'The grand garden', waves: 4, count: 10, hp: 7, speed: 55, coins: 210, gap: 1.9, color: '#e2e4b6' },
];

export const PADS: Point[] = [
  { x: 155, y: 440 }, { x: 300, y: 280 }, { x: 330, y: 75 },
  { x: 565, y: 315 }, { x: 620, y: 550 }, { x: 825, y: 365 },
];
export const PATH: Point[] = [
  { x: -45, y: 300 }, { x: 180, y: 300 }, { x: 180, y: 175 },
  { x: 460, y: 175 }, { x: 460, y: 450 }, { x: 760, y: 450 },
  { x: 760, y: 275 }, { x: 920, y: 275 }, { x: 920, y: 520 },
  { x: 1040, y: 520 },
];
const lengths = PATH.slice(1).map((point, i) => Math.hypot(point.x - PATH[i].x, point.y - PATH[i].y));
export const PATH_LENGTH = lengths.reduce((sum, length) => sum + length, 0);

export function pointOnPath(distance: number): Point {
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i]) {
      const ratio = Math.max(0, distance) / lengths[i];
      return { x: PATH[i].x + (PATH[i + 1].x - PATH[i].x) * ratio, y: PATH[i].y + (PATH[i + 1].y - PATH[i].y) * ratio };
    }
    distance -= lengths[i];
  }
  return { ...PATH[PATH.length - 1] };
}

export class GardenGame {
  level = 0;
  wave = 0;
  hearts = 8;
  coins = 140;
  phase: 'build' | 'wave' | 'won' | 'lost' = 'build';
  towers: Tower[] = [];
  snails: Snail[] = [];
  sparks: Spark[] = [];
  charge: Record<Power, number> = { rainbow: 0, freeze: 0 };
  cooldown: Record<Power, number> = { rainbow: 18, freeze: 24 };
  powerFlash = 0;
  lastPower: Power = 'rainbow';
  sentHome = 0;
  private remaining = 0;
  private spawnTimer = 0;
  private nextId = 0;

  constructor(level = 0) {
    this.level = Math.max(0, Math.min(LEVELS.length - 1, Math.floor(level) || 0));
    this.coins = LEVELS[this.level].coins;
    // The first powers arrive early, then recharge more slowly after use.
    this.charge = { rainbow: 11, freeze: 14 };
  }

  plant(pad: number, kind: Flower): boolean {
    const flower = FLOWERS[kind];
    if (!PADS[pad] || this.phase === 'won' || this.phase === 'lost' ||
      this.level < flower.unlock || this.coins < flower.cost || this.towers.some(tower => tower.pad === pad)) return false;
    this.coins -= flower.cost;
    this.towers.push({ pad, kind, cooldown: 0 });
    return true;
  }

  remove(pad: number): boolean {
    if (this.phase === 'won' || this.phase === 'lost') return false;
    const tower = this.towers.find(item => item.pad === pad);
    if (!tower) return false;
    this.coins += FLOWERS[tower.kind].cost;
    this.towers = this.towers.filter(item => item !== tower);
    return true;
  }

  startWave(): boolean {
    if (this.phase !== 'build' || !this.towers.length) return false;
    this.wave++;
    this.remaining = LEVELS[this.level].count + (this.wave - 1) * 2;
    this.spawnTimer = 0.5;
    this.phase = 'wave';
    return true;
  }

  ready(power: Power): boolean {
    return this.charge[power] >= this.cooldown[power];
  }

  usePower(power: Power): boolean {
    if (this.phase !== 'wave' || !this.ready(power) || !this.snails.length) return false;
    this.charge[power] = 0;
    this.powerFlash = 1.1;
    this.lastPower = power;
    this.snails.forEach(snail => {
      if (power === 'rainbow') snail.hp -= 5;
      else snail.slow = 8;
    });
    this.clearPopped();
    return true;
  }

  private clearPopped() {
    this.snails = this.snails.filter(snail => {
      if (snail.hp > 0) return true;
      this.coins += 8;
      this.sentHome++;
      this.sparks.push({ from: { ...snail }, to: { ...snail }, kind: 'rainbow', life: 0.45 });
      return false;
    });
  }

  update(dt: number) {
    if (this.phase !== 'wave') return;
    dt = Math.min(Math.max(dt, 0), 0.1);
    const settings = LEVELS[this.level];
    this.powerFlash = Math.max(0, this.powerFlash - dt);
    this.sparks = this.sparks.filter(spark => (spark.life -= dt) > 0);
    for (const power of ['rainbow', 'freeze'] as Power[]) {
      this.charge[power] = Math.min(this.cooldown[power], this.charge[power] + dt);
    }
    this.spawnTimer -= dt;
    if (this.remaining > 0 && this.spawnTimer <= 0) {
      const variant = this.nextId % 3;
      const hp = settings.hp + (this.wave - 1) * 0.6;
      this.snails.push({ id: this.nextId++, ...PATH[0], distance: 0, hp, maxHp: hp, speed: settings.speed + variant * 3, slow: 0, variant });
      this.remaining--;
      this.spawnTimer = settings.gap;
    }
    for (const snail of this.snails) {
      snail.distance += snail.speed * (snail.slow > 0 ? 0.35 : 1) * dt;
      snail.slow = Math.max(0, snail.slow - dt);
      Object.assign(snail, pointOnPath(snail.distance));
    }
    for (const tower of this.towers) {
      tower.cooldown -= dt;
      if (tower.cooldown > 0) continue;
      const flower = FLOWERS[tower.kind];
      const origin = PADS[tower.pad];
      const target = this.snails.filter(snail => snail.hp > 0 && snail.distance < PATH_LENGTH &&
        Math.hypot(snail.x - origin.x, snail.y - origin.y) < flower.range)
        .sort((a, b) => b.distance - a.distance)[0];
      if (!target) continue;
      target.hp -= flower.damage;
      if (tower.kind === 'mint') target.slow = Math.max(target.slow, 2.5);
      tower.cooldown = flower.interval;
      this.sparks.push({ from: origin, to: { ...target }, kind: tower.kind, life: 0.3 });
    }
    this.clearPopped();
    this.snails = this.snails.filter(snail => {
      if (snail.distance < PATH_LENGTH) return true;
      this.hearts = Math.max(0, this.hearts - 1);
      return false;
    });
    if (this.hearts <= 0) this.phase = 'lost';
    else if (!this.remaining && !this.snails.length) {
      this.phase = this.wave >= settings.waves ? 'won' : 'build';
      this.coins += 35;
      this.sparks = [];
      this.powerFlash = 0;
    }
  }
}
