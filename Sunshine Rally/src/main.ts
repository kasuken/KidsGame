import './style.css';
import { advance, clamp, Input, newDrive, parseProgress, routes } from './game';
import { render } from './render';

const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = get<HTMLCanvasElement>('road');
const ctx = canvas.getContext('2d')!;
const overlay = get('overlay');
const dialog = document.querySelector<HTMLElement>('.dialog')!;
const primary = get<HTMLButtonElement>('primary');
const secondary = get<HTMLButtonElement>('secondary');
const pauseButton = get<HTMLButtonElement>('pause');
const soundButton = get<HTMLButtonElement>('sound');
const routePicker = get('routes');
const storageKey = 'sunshine-rally-progress-v1';
let storageAvailable = true;
let raw: string | null = null;
try { raw = localStorage.getItem(storageKey); } catch { storageAvailable = false; }
const progress = parseProgress(raw);
let drive = newDrive(0);
let mode: 'welcome' | 'driving' | 'paused' | 'finished' | 'routes' = 'welcome';
let width = 1;
let height = 1;
let last = 0;
let noticeUntil = 0;
let audio: AudioContext | undefined;
const pointers = new Map<number, keyof Input>();
const keys = new Set<string>();
const controls = { left: get<HTMLButtonElement>('left'), right: get<HTMLButtonElement>('right'), brake: get<HTMLButtonElement>('brake') };
const input: Input = { left: false, right: false, brake: false };

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
  catch { storageAvailable = false; }
}
function initAudio() {
  if (!progress.sound) return;
  try {
    const Audio = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audio ??= new Audio();
    void audio.resume().catch(() => {});
  } catch { /* Sound is optional on browsers without Web Audio. */ }
}
function chime(success = true) {
  if (!progress.sound || !audio || audio.state !== 'running') return;
  const now = audio.currentTime;
  for (let i = 0; i < (success ? 3 : 1); i++) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = success ? [523, 659, 784][i] : 180;
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.045, now + i * 0.1 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.23);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now + i * 0.1);
    oscillator.stop(now + i * 0.1 + 0.25);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}
function refreshSound() {
  soundButton.innerHTML = `♪ <span>${progress.sound ? 'On' : 'Off'}</span>`;
  soundButton.setAttribute('aria-pressed', String(progress.sound));
  soundButton.setAttribute('aria-label', `Turn sound ${progress.sound ? 'off' : 'on'}`);
}
soundButton.addEventListener('click', () => {
  progress.sound = !progress.sound;
  initAudio();
  refreshSound();
  save();
  chime();
});

function syncInput() {
  const active = [...pointers.values()];
  input.left = active.includes('left') || keys.has('ArrowLeft') || keys.has('KeyA');
  input.right = active.includes('right') || keys.has('ArrowRight') || keys.has('KeyD');
  input.brake = active.includes('brake') || keys.has('Space') || keys.has('ArrowDown');
  for (const name of Object.keys(controls) as (keyof Input)[]) controls[name].classList.toggle('held', input[name]);
}
function releaseControls() { pointers.clear(); keys.clear(); syncInput(); }
for (const name of Object.keys(controls) as (keyof Input)[]) {
  const button = controls[name];
  button.addEventListener('pointerdown', event => {
    if (mode !== 'driving' || event.button !== 0) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, name);
    syncInput();
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(eventName, event => {
      pointers.delete((event as PointerEvent).pointerId);
      syncInput();
    });
  }
  button.addEventListener('contextmenu', event => event.preventDefault());
}
const drivingKeys = ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'ArrowDown'];
window.addEventListener('keydown', event => {
  if ((event.code === 'KeyP' || event.code === 'Escape') && !event.repeat) {
    if (mode === 'driving') pause();
    else if (mode === 'paused') resume();
    return;
  }
  if (mode !== 'driving' || !drivingKeys.includes(event.code)) return;
  // Keep normal Space activation for focused utility buttons.
  if (event.code === 'Space' && document.activeElement?.closest('.utilities button, a')) return;
  event.preventDefault();
  keys.add(event.code);
  syncInput();
});
window.addEventListener('keyup', event => { keys.delete(event.code); syncInput(); });

function setOverlay(show: boolean) {
  overlay.hidden = !show;
  document.querySelector('.app')!.toggleAttribute('inert', show);
  if (show) { releaseControls(); primary.focus(); }
  else { canvas.tabIndex = -1; canvas.focus(); }
}
function showDialog(kicker: string, title: string, text: string, action: string, other: string) {
  get('dialog-kicker').textContent = kicker;
  get('dialog-title').textContent = title;
  get('dialog-text').textContent = text;
  primary.textContent = action;
  secondary.textContent = other;
  routePicker.hidden = true;
  get('instructions').hidden = mode !== 'welcome';
  get('dialog-note').textContent = storageAvailable ? 'No timer. No game over. Just keep exploring.' : 'Progress stays here for this visit; browser storage is unavailable.';
  setOverlay(true);
}
function announce(text: string) { get('notice').textContent = text; noticeUntil = performance.now() + 3000; }
function start(level: number) {
  initAudio();
  drive = newDrive(clamp(level, 0, progress.unlocked));
  mode = 'driving';
  pauseButton.disabled = false;
  get('route-number').textContent = `ROAD TRIP ${String(drive.level + 1).padStart(2, '0')} / 06`;
  get('route-name').textContent = routes[drive.level].name;
  setOverlay(false);
  announce(drive.level === 0 ? 'Hold ◀ or ▶ to steer. Your car goes all by itself!' : 'Pass the cars. Hold SLOW on the bends!');
}
function pause() {
  if (mode !== 'driving') return;
  mode = 'paused';
  showDialog('A LITTLE PIT STOP', 'Take a breather.', 'Your car is parked right here. Ready when you are!', 'Keep driving →', 'Choose a road trip');
}
function resume() {
  initAudio();
  mode = 'driving';
  releaseControls();
  setOverlay(false);
}
pauseButton.addEventListener('click', pause);
window.addEventListener('blur', () => { releaseControls(); pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseControls(); pause(); } });

function finish() {
  mode = 'finished';
  pauseButton.disabled = true;
  const available = drive.objects.filter(object => object.kind === 'star').length;
  const award = drive.stars >= Math.ceil(available * 0.7) ? 3 : drive.stars >= Math.ceil(available * 0.3) ? 2 : 1;
  progress.best[drive.level] = Math.max(progress.best[drive.level], award);
  progress.unlocked = Math.max(progress.unlocked, Math.min(routes.length - 1, drive.level + 1));
  save();
  chime();
  const final = drive.level === routes.length - 1;
  showDialog(`${'★'.repeat(award)}${'☆'.repeat(3 - award)} · ROAD TRIP COMPLETE`, final ? 'What a road trip!' : 'You made it!',
    `${drive.stars} stars collected! ${final ? 'You explored all six routes. Pick a favorite and go again!' : 'Another sunny adventure is ready for you.'}`,
    final ? 'Drive again →' : 'Next road trip →', 'Choose a road trip');
}
function showRoutes() {
  mode = 'routes';
  pauseButton.disabled = true;
  showDialog('SIX PLACES. ONE HAPPY DRIVER.', 'Where to?', 'Start small. Every finish opens a longer road with a few more twists.', 'Drive latest route →', 'Back to the start');
  routePicker.replaceChildren();
  routes.forEach((route, index) => {
    const button = document.createElement('button');
    button.className = 'route';
    button.disabled = index > progress.unlocked;
    const title = document.createElement('b');
    title.textContent = `${String(index + 1).padStart(2, '0')} · ${route.place}`;
    const detail = document.createElement('small');
    const seconds = Math.round(route.length / route.speed);
    detail.textContent = button.disabled ? '🔒 Finish the previous trip' : `${seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`} cruise · ${'★'.repeat(progress.best[index])}${'☆'.repeat(3 - progress.best[index])}`;
    button.append(title, detail);
    button.addEventListener('click', () => start(index));
    routePicker.append(button);
  });
  routePicker.hidden = false;
}
primary.addEventListener('click', () => {
  if (mode === 'paused') { resume(); return; }
  if (mode === 'finished') start(drive.level === routes.length - 1 ? drive.level : drive.level + 1);
  else start(progress.unlocked);
});
secondary.addEventListener('click', () => {
  if (mode !== 'routes') showRoutes();
  else {
    mode = 'welcome';
    showDialog('YOUR FIRST BIG LITTLE ADVENTURE', 'Hello, driver!', 'A little red car. A big blue sky. Let’s take the sunny way home.', 'Let’s drive! →', 'Choose a road trip · 6 places to go');
  }
});
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const buttons = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')).filter(el => el.getClientRects().length > 0);
  const first = buttons[0];
  const last = buttons[buttons.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
function resize() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  render(ctx, width, height, drive);
}
new ResizeObserver(resize).observe(canvas);
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (mode === 'driving') {
    const event = advance(drive, input, dt);
    if (event === 'finish') finish();
    else if (event === 'star') { chime(); announce('★ A little more sunshine!'); }
    else if (event === 'bump') { chime(false); announce('Whoops! All okay. Let’s keep going!'); }
    else if (now > noticeUntil) {
      get('notice').textContent = Math.abs(drive.x) > 0.92 ? 'Soft sand! Steer back toward the middle.' : routes[drive.level].place + ' · Enjoy the ride.';
    }
    get('stars').textContent = String(drive.stars);
    get('speed').textContent = String(Math.round(drive.speed));
    get<HTMLProgressElement>('progress').value = drive.distance / routes[drive.level].length * 100;
    render(ctx, width, height, drive);
  }
  requestAnimationFrame(frame);
}
refreshSound();
setOverlay(true);
resize();
requestAnimationFrame(frame);
