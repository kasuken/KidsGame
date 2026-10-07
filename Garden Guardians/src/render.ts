import { FLOWERS, GardenGame, LEVELS, PADS, PATH, type Point } from './game';

const INK = '#355542';

export function createRenderer(canvas: HTMLCanvasElement, board: HTMLElement) {
  const ctx = canvas.getContext('2d')!;
  let width = 1000;
  let height = 640;
  const resize = new ResizeObserver(() => {
    const rect = board.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.round(rect.width * dpr);
    height = Math.round(rect.height * dpr);
    canvas.width = width;
    canvas.height = height;
  });
  resize.observe(board);

  function ellipse(x: number, y: number, rx: number, ry: number, fill: string) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function line(points: Point[], color: string, thickness: number) {
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function flower(x: number, y: number, size: number, color: string) {
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5;
      ellipse(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size * 0.65, size * 0.65, color);
    }
    ellipse(x, y, size * 0.5, size * 0.5, '#ffc857');
  }

  function tree(x: number, y: number, size: number) {
    ellipse(x + 8, y + 28, size * 0.85, size * 0.28, '#375b3b18');
    line([{ x, y }, { x, y: y + 30 }], '#a38758', 13);
    ellipse(x, y - 12, size, size * 0.8, '#81ad70');
    ellipse(x - size * 0.25, y - size * 0.4, size * 0.8, size * 0.67, '#9bc67e');
    ellipse(x - size * 0.4, y - size * 0.6, size * 0.28, size * 0.16, '#b5d993');
    ellipse(x + size * 0.3, y - size * 0.1, 5, 6, '#eeab79');
  }

  function strawberry(x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.bezierCurveTo(38, -34, 34, 9, 0, 34);
    ctx.bezierCurveTo(-34, 9, -38, -34, 0, -16);
    ctx.fillStyle = '#ec786a';
    ctx.fill();
    line([{ x: -15, y: -22 }, { x: 0, y: -16 }, { x: 13, y: -27 }], '#588c59', 8);
    for (const [sx, sy] of [[-12, -4], [11, -5], [-6, 10], [8, 14]]) ellipse(sx, sy, 2, 3, '#fff2bd');
    ctx.restore();
  }

  function snail(x: number, y: number, variant: number, slow: boolean, time: number) {
    ctx.save();
    ctx.translate(x, y + Math.sin(time * 4 + x) * 1.3);
    ellipse(0, 20, 29, 7, '#3555421b');
    ellipse(0, 11, 30, 13, slow ? '#a6e2e2' : '#faf0ce');
    ellipse(23, 2, 12, 18, slow ? '#a6e2e2' : '#faf0ce');
    line([{ x: 19, y: -8 }, { x: 16, y: -20 }], INK, 2.5);
    line([{ x: 29, y: -8 }, { x: 33, y: -20 }], INK, 2.5);
    ellipse(16, -21, 3, 4, INK);
    ellipse(33, -21, 3, 4, INK);
    ellipse(-5, -3, 23, 23, ['#b69acc', '#e9ae7b', '#93b8cf'][variant]);
    ctx.beginPath();
    for (let i = 0; i < 65; i++) {
      const angle = i / 7;
      const radius = i / 4;
      const px = -5 + Math.cos(angle) * radius;
      const py = -3 + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ffffff85';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(26, 4, 4, 0, Math.PI);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (slow) {
      ctx.font = '20px Georgia';
      ctx.fillStyle = '#337f9f';
      ctx.fillText('❄', -12, -36);
    }
    ctx.restore();
  }

  return (game: GardenGame, time: number, selectedPad: number | null) => {
    ctx.setTransform(width / 1000, 0, 0, height / 640, 0, 0);
    ctx.clearRect(0, 0, 1000, 640);
    ctx.fillStyle = LEVELS[game.level].color;
    ctx.fillRect(0, 0, 1000, 640);

    // Fixed, scattered details keep the meadow calm instead of flickering each frame.
    for (let i = 0; i < 100; i++) {
      const x = (i * 137 + 29) % 1000;
      const y = (i * 89 + 41) % 640;
      line([{ x: x - 3, y }, { x, y: y + 5 }, { x: x + 4, y: y - 2 }], '#89ae6a30', 2);
    }
    ellipse(570, 80, 90, 40, '#edf2cd80');
    ellipse(280, 540, 85, 47, '#b9d39770');
    ellipse(50, 590, 85, 56, '#b9d39770');
    line(PATH, '#b9bb893f', 91);
    line(PATH, '#c6b484', 78);
    line(PATH, '#f4dc9f', 69);
    line(PATH, '#f9e8bb', 51);
    ctx.setLineDash([2, 20]);
    line(PATH, '#cfb57c65', 2);
    ctx.setLineDash([]);

    for (const [x, y, s] of [[45, 90, 55], [105, 65, 44], [565, 63, 42], [660, 100, 58], [815, 80, 37], [45, 490, 42], [375, 595, 47], [965, 80, 54], [965, 615, 37]]) tree(x, y, s);
    for (const [x, y] of [[60, 380], [350, 385], [555, 210], [720, 60], [60, 580], [670, 610], [885, 425], [250, 590]]) {
      flower(x, y, 5, '#fff8e4');
      flower(x + 16, y + 12, 4, '#f1b6b1');
    }

    // A tiny strawberry cottage is the friendly destination, not a battle target.
    ellipse(975, 486, 57, 24, '#62784925');
    ctx.fillStyle = '#fff4d4';
    ctx.fillRect(946, 428, 62, 62);
    ctx.beginPath();
    ctx.moveTo(933, 434);
    ctx.lineTo(977, 392);
    ctx.lineTo(1022, 434);
    ctx.closePath();
    ctx.fillStyle = '#d77764';
    ctx.fill();
    ctx.fillStyle = '#6b957b';
    ctx.fillRect(971, 459, 18, 31);
    ellipse(958, 450, 6, 7, '#e8bb76');
    strawberry(953, 559, 0.55);
    strawberry(986, 575, 0.7);
    strawberry(938, 590, 0.45);

    if (selectedPad !== null) {
      const tower = game.towers.find(item => item.pad === selectedPad);
      if (tower) {
        const center = PADS[selectedPad];
        ellipse(center.x, center.y, FLOWERS[tower.kind].range, FLOWERS[tower.kind].range, '#ffffff28');
        ctx.beginPath();
        ctx.arc(center.x, center.y, FLOWERS[tower.kind].range, 0, Math.PI * 2);
        ctx.strokeStyle = '#3a725c60';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for (const visitor of game.snails) {
      snail(visitor.x, visitor.y, visitor.variant, visitor.slow > 0, time);
      if (visitor.hp < visitor.maxHp) {
        line([{ x: visitor.x - 18, y: visitor.y - 33 }, { x: visitor.x + 18, y: visitor.y - 33 }], '#fff8de', 5);
        line([{ x: visitor.x - 18, y: visitor.y - 33 }, { x: visitor.x - 18 + 36 * Math.max(0, visitor.hp / visitor.maxHp), y: visitor.y - 33 }], '#79ad83', 5);
      }
    }

    for (const spark of game.sparks) {
      ctx.globalAlpha = Math.min(1, spark.life * 4);
      if (spark.kind === 'rainbow') {
        for (let i = 0; i < 6; i++) {
          const angle = i * Math.PI / 3;
          const radius = (0.5 - spark.life) * 75;
          ellipse(spark.to.x + Math.cos(angle) * radius, spark.to.y + Math.sin(angle) * radius, 5, 5, ['#f6b663', '#e998b5', '#fffce9'][i % 3]);
        }
      } else if (spark.kind !== 'freeze') {
        const progress = 1 - spark.life / 0.3;
        const x = spark.from.x + (spark.to.x - spark.from.x) * progress;
        const y = spark.from.y + (spark.to.y - spark.from.y) * progress;
        ellipse(x, y, 9, 9, FLOWERS[spark.kind].color);
        ellipse(x - 2, y - 3, 3, 3, '#ffffff');
      }
      ctx.globalAlpha = 1;
    }
    if (game.powerFlash > 0) {
      ctx.globalAlpha = game.powerFlash * 0.18;
      ctx.fillStyle = game.lastPower === 'rainbow' ? '#fff8ae' : '#c0f6ff';
      ctx.fillRect(0, 0, 1000, 640);
      ctx.globalAlpha = 1;
    }
  };
}
