import { bendAt, Drive, routes } from './game';

export function render(ctx: CanvasRenderingContext2D, width: number, height: number, drive: Drive) {
  const route = routes[drive.level];
  const horizon = height * 0.34;
  const bottom = height * 0.94;
  const bend = bendAt(drive.level, drive.distance + 240);
  const roadHalf = width * 0.34;
  const project = (z: number, lane = 0) => {
    const scale = 1 / (1 + z / 170);
    const center = width * 0.5 + bend * width * 0.37 * (1 - scale) ** 2;
    return { x: center + lane * roadHalf * scale, y: horizon + (bottom - horizon) * scale, half: roadHalf * scale, scale };
  };
  function polygon(points: number[][], color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fill();
  }
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = route.sky;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff0b5';
  ctx.beginPath();
  ctx.arc(width * 0.77, height * 0.15, height * 0.095, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const x = width * (i * 0.27 - 0.08) - bend * 20;
    polygon([[x, horizon + 24], [x + width * 0.13, horizon - height * (i % 2 ? 0.16 : 0.23)], [x + width * 0.3, horizon + 24]], drive.level >= 4 ? '#bd948b' : '#74b9ad');
    polygon([[x + width * 0.095, horizon - height * 0.10], [x + width * 0.13, horizon - height * 0.16], [x + width * 0.165, horizon - height * 0.10]], '#e1e5c9');
  }
  ctx.fillStyle = route.sea;
  ctx.fillRect(0, horizon, width, height * 0.18);
  ctx.fillStyle = '#ffffff45';
  for (let i = 0; i < 8; i++) ctx.fillRect((i * 157) % width, horizon + 10 + (i % 3) * 12, 60, 2);
  ctx.fillStyle = route.land;
  ctx.fillRect(0, horizon + height * 0.14, width, height);
  for (let z = 2400; z > 0; z -= 20) {
    const far = project(z);
    const near = project(z - 20);
    const stripe = Math.floor((drive.distance + z) / 85) % 2 === 0;
    polygon([[far.x - far.half * 1.1, far.y], [far.x + far.half * 1.1, far.y], [near.x + near.half * 1.1, near.y], [near.x - near.half * 1.1, near.y]], stripe ? '#fff5d6' : '#ea8363');
    polygon([[far.x - far.half, far.y], [far.x + far.half, far.y], [near.x + near.half, near.y], [near.x - near.half, near.y]], stripe ? '#52656a' : '#55686d');
    if (stripe) {
      for (const lane of [-1 / 3, 1 / 3]) {
        polygon([[far.x + far.half * (lane - 0.012), far.y], [far.x + far.half * (lane + 0.012), far.y], [near.x + near.half * (lane + 0.012), near.y], [near.x + near.half * (lane - 0.012), near.y]], '#fff2ce');
      }
    }
  }
  const edge = project(0);
  ctx.fillStyle = '#55686d';
  ctx.fillRect(edge.x - edge.half, bottom, edge.half * 2, height - bottom);

  function palm(x: number, y: number, scale: number, flip: number) {
    const size = width * 0.17 * scale;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.strokeStyle = '#9b7656';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + size * 0.14 * flip, y - size * 0.5, x, y - size);
    ctx.stroke();
    for (let i = -2; i <= 2; i++) {
      const tip = x + i * size * 0.31;
      polygon([[x, y - size], [tip, y - size - size * (0.27 - Math.abs(i) * 0.06)], [tip + i * size * 0.08, y - size + size * 0.22]], i % 2 ? '#267367' : '#318b72');
    }
  }
  for (let i = 15; i >= 0; i--) {
    const z = i * 165 - drive.distance % 165;
    if (z < 0) continue;
    const side = i % 2 ? -1 : 1;
    const p = project(z, side * 1.5);
    palm(p.x, p.y, p.scale, side);
  }
  function car(x: number, y: number, size: number, color: string, player = false) {
    ctx.fillStyle = '#142c3540';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.64, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#193039';
    ctx.fillRect(x - size * 0.52, y - size * 0.38, size * 0.18, size * 0.38);
    ctx.fillRect(x + size * 0.34, y - size * 0.38, size * 0.18, size * 0.38);
    polygon([[x - size * 0.45, y - size * 0.1], [x - size * 0.48, y - size * 0.44], [x - size * 0.3, y - size * 0.76], [x + size * 0.3, y - size * 0.76], [x + size * 0.48, y - size * 0.44], [x + size * 0.45, y - size * 0.1]], color);
    polygon([[x - size * 0.31, y - size * 0.47], [x - size * 0.23, y - size * 0.69], [x + size * 0.23, y - size * 0.69], [x + size * 0.31, y - size * 0.47]], '#b3e0df');
    ctx.fillStyle = '#204453';
    ctx.fillRect(x - size * 0.3, y - size * 0.43, size * 0.6, size * 0.1);
    if (player) {
      ctx.fillStyle = '#ffd094';
      ctx.beginPath();
      ctx.arc(x - size * 0.13, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#efb74c';
      ctx.fillRect(x - size * 0.23, y - size * 0.54, size * 0.19, size * 0.055);
    }
    ctx.fillStyle = '#fff0bd';
    ctx.fillRect(x - size * 0.37, y - size * 0.25, size * 0.19, size * 0.07);
    ctx.fillRect(x + size * 0.18, y - size * 0.25, size * 0.19, size * 0.07);
    ctx.fillStyle = '#fff8e8';
    ctx.fillRect(x - size * 0.11, y - size * 0.19, size * 0.22, size * 0.07);
  }
  const remaining = route.length - drive.distance;
  if (remaining < 2000) {
    const p = project(Math.max(0, remaining));
    const top = p.y - width * 0.24 * p.scale;
    ctx.fillStyle = '#fff8e8';
    ctx.fillRect(p.x - p.half, top, p.half * 0.055, p.y - top);
    ctx.fillRect(p.x + p.half * 0.95, top, p.half * 0.055, p.y - top);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#173e47' : '#fff8e8';
      ctx.fillRect(p.x - p.half + i * p.half / 6, top + j * p.half / 12, p.half / 6 + 1, p.half / 12 + 1);
    }
  }
  const objects = drive.objects.filter(o => !o.done && o.z > drive.distance && o.z < drive.distance + 2200).sort((a, b) => b.z - a.z);
  for (const object of objects) {
    const p = project(object.z - drive.distance, object.x);
    if (object.kind === 'car') car(p.x, p.y, width * 0.12 * p.scale, object.color);
    else {
      const radius = width * 0.037 * p.scale;
      const points = Array.from({ length: 10 }, (_, i) => {
        const angle = i * Math.PI / 5 - Math.PI / 2;
        const r = radius * (i % 2 ? 0.48 : 1);
        return [p.x + Math.cos(angle) * r, p.y - radius * 1.6 + Math.sin(angle) * r];
      });
      ctx.strokeStyle = '#a66d24';
      ctx.lineWidth = Math.max(1, p.scale * 3);
      polygon(points, '#ffe17c');
      ctx.stroke();
    }
  }
  ctx.save();
  if (drive.cooldown > 0) ctx.globalAlpha = 0.65;
  car(width * 0.5 + drive.x * roadHalf, bottom, width * 0.13, '#ff654c', true);
  ctx.restore();
}
