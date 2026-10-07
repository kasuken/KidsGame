export const routes = [
  { name: 'Hello, sunshine!', place: 'SUNNY SHORE', length: 1400, speed: 65, curve: 0.10, traffic: 0, sky: '#8edcde', land: '#edce8a', sea: '#46bfc3' },
  { name: 'Palm parade', place: 'PALM COAST', length: 2300, speed: 75, curve: 0.25, traffic: 480, sky: '#91dedb', land: '#97c986', sea: '#3eb5c2' },
  { name: 'The blue bay', place: 'BLUE BAY', length: 3300, speed: 85, curve: 0.40, traffic: 420, sky: '#93d7ec', land: '#efd9a0', sea: '#389bc0' },
  { name: 'Rolling along', place: 'GREEN HILLS', length: 4500, speed: 95, curve: 0.55, traffic: 360, sky: '#b3e4e0', land: '#86b77e', sea: '#5e9b87' },
  { name: 'Peachy peaks', place: 'PEACH CANYON', length: 5800, speed: 105, curve: 0.70, traffic: 310, sky: '#f4c4a2', land: '#cf9674', sea: '#ae7f70' },
  { name: 'Golden home stretch', place: 'SUNSET POINT', length: 7400, speed: 115, curve: 0.85, traffic: 270, sky: '#efb4a0', land: '#b8af79', sea: '#689fa9' },
] as const;

export type RoadObject = { z: number; x: number; kind: 'star' | 'car'; color: string; done: boolean };
export type Input = { left: boolean; right: boolean; brake: boolean };
export type Drive = {
  level: number; distance: number; speed: number; x: number; stars: number;
  bumps: number; cooldown: number; finished: boolean; objects: RoadObject[];
};
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const bendAt = (level: number, distance: number) => Math.sin(distance / 430) * routes[level].curve;

export function newDrive(level: number): Drive {
  const route = routes[level];
  const objects: RoadObject[] = [];
  for (let z = 260, i = 0; z < route.length - 100; z += 190, i++) {
    objects.push({ z, x: [0, -0.58, 0, 0.58][i % 4], kind: 'star', color: '#ffda64', done: false });
  }
  if (route.traffic) {
    for (let z = 700, i = 0; z < route.length - 100; z += route.traffic, i++) {
      objects.push({ z, x: [-0.58, 0.58, 0][i % 3], kind: 'car', color: ['#4aabbc', '#ffd274', '#a5b57b'][i % 3], done: false });
    }
  }
  return { level, distance: 0, speed: 0, x: 0, stars: 0, bumps: 0, cooldown: 0, finished: false, objects };
}

export function advance(drive: Drive, input: Input, delta: number): 'star' | 'bump' | 'finish' | undefined {
  if (drive.finished) return;
  const dt = clamp(delta, 0, 0.05);
  const route = routes[drive.level];
  drive.cooldown = Math.max(0, drive.cooldown - dt);
  const offroad = Math.abs(drive.x) > 0.92;
  const target = route.speed * (input.brake ? 0.3 : offroad ? 0.48 : 1);
  drive.speed += (target - drive.speed) * Math.min(1, dt * 2);
  const steering = Number(input.right) - Number(input.left);
  drive.x = clamp(drive.x + steering * dt * 1.05 - bendAt(drive.level, drive.distance) * dt * (drive.speed / route.speed) * 0.26, -1.22, 1.22);
  // Soft shoulders guide little drivers back instead of trapping them off-road.
  if (offroad && !steering) drive.x -= Math.sign(drive.x) * dt * 0.18;
  const previous = drive.distance;
  drive.distance = Math.min(route.length, drive.distance + drive.speed * dt);
  let event: 'star' | 'bump' | 'finish' | undefined;
  for (const object of drive.objects) {
    if (object.done) continue;
    if (object.kind === 'car') object.z += route.speed * 0.20 * dt;
    if (object.z <= drive.distance && object.z >= previous - 10) {
      object.done = true;
      if (Math.abs(object.x - drive.x) < (object.kind === 'star' ? 0.27 : 0.25)) {
        if (object.kind === 'star') { drive.stars++; event = 'star'; }
        else if (drive.cooldown === 0) {
          drive.bumps++;
          drive.speed *= 0.45;
          drive.cooldown = 1.5;
          event = 'bump';
        }
      }
    } else if (object.z < drive.distance - 10) object.done = true;
  }
  if (drive.distance >= route.length) { drive.finished = true; event = 'finish'; }
  return event;
}

export type Progress = { unlocked: number; best: number[]; sound: boolean };
export function parseProgress(raw: string | null): Progress {
  const fallback = { unlocked: 0, best: routes.map(() => 0), sound: false };
  try {
    const data = JSON.parse(raw || 'null');
    if (!data || typeof data !== 'object') return fallback;
    return {
      unlocked: Number.isInteger(data.unlocked) ? clamp(data.unlocked, 0, routes.length - 1) : 0,
      best: routes.map((_, i) => Number.isInteger(data.best?.[i]) ? clamp(data.best[i], 0, 3) : 0),
      sound: data.sound === true,
    };
  } catch { return fallback; }
}
