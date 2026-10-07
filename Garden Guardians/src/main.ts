import './styles.css';
import { FLOWERS, GardenGame, LEVELS, PADS, type Flower, type Power } from './game';
import { createRenderer } from './render';

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}
function text(id: string, value: string) {
  const node = element(id);
  if (node.textContent !== value) node.textContent = value;
}

type Progress = { unlocked: number; stars: number[] };
const SAVE_KEY = 'garden-guardians-progress-v1';
function loadProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (saved && Number.isInteger(saved.unlocked) && saved.unlocked >= 0 && saved.unlocked < LEVELS.length &&
      Array.isArray(saved.stars) && saved.stars.length === LEVELS.length &&
      saved.stars.every((star: unknown) => typeof star === 'number' && Number.isInteger(star) && star >= 0 && star <= 3)) {
      return { unlocked: saved.unlocked, stars: saved.stars };
    }
  } catch { /* The garden still works when Safari storage is unavailable. */ }
  return { unlocked: 0, stars: LEVELS.map(() => 0) };
}
const progress = loadProgress();
let game = new GardenGame();
let selected: Flower = 'bloom';
let selectedPad: number | null = null;
type Dialog = 'welcome' | 'pause' | 'won' | 'lost' | 'picker';
let dialog: Dialog = 'welcome';
let pickerReturn: Dialog = 'welcome';
let isPaused = true;
let focusBeforeDialog: HTMLElement | null = null;
let bannerUntil = 0;
let soundEnabled = false;
let audio: AudioContext | null = null;
let hintUntil = 0;
let gameTime = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const overlay = element('overlay');
const app = element('app');
const primary = element<HTMLButtonElement>('dialog-primary');
const secondary = element<HTMLButtonElement>('dialog-secondary');
const canvas = element<HTMLCanvasElement>('garden');
const render = createRenderer(canvas, element('board'));

function chime(frequency = 620) {
  if (!soundEnabled) return;
  try {
    const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return;
    audio ??= new Audio();
    if (audio.state === 'suspended') void audio.resume().catch(() => {});
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.3, audio.currentTime + 0.12);
    volume.gain.setValueAtTime(0.0001, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.055, audio.currentTime + 0.015);
    volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.22);
    oscillator.connect(volume);
    volume.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.24);
    oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
  } catch { /* Sound is optional, including on older iPads. */ }
}

function hint(message: string, seconds = 5) {
  text('hint', message);
  hintUntil = performance.now() + seconds * 1000;
}

function closeDialog() {
  overlay.hidden = true;
  app.removeAttribute('inert');
  isPaused = false;
  (focusBeforeDialog && app.contains(focusBeforeDialog) ? focusBeforeDialog : element('start-wave')).focus();
}

function startGarden(level: number) {
  game = new GardenGame(Math.min(level, progress.unlocked));
  selected = 'bloom';
  selectedPad = null;
  bannerUntil = 0;
  text('power-banner', '');
  closeDialog();
  sync();
  hint(game.level === 0 ? 'Tap a + patch to plant your first bubble bloom!' :
    game.level === 1 ? 'New friend! Chilly mint slows the snails.' :
    game.level === 2 ? 'New friend! Sunny burst makes extra big bubbles.' : 'Grow your team, then tap Let’s go!');
  padButtons[0].focus();
}

function showDialog(mode: typeof dialog) {
  if (overlay.hidden) focusBeforeDialog = document.activeElement as HTMLElement;
  dialog = mode;
  isPaused = true;
  overlay.hidden = false;
  app.setAttribute('inert', '');
  element('how-to').hidden = mode !== 'welcome';
  element('level-picker').hidden = mode !== 'picker';
  secondary.hidden = mode === 'picker';
  const finalGarden = game.level === LEVELS.length - 1;
  const titles = {
    welcome: 'Small flowers.\nBig superpowers.',
    pause: 'A little garden break.',
    won: finalGarden ? 'You’re a garden guardian!' : 'Hooray! Happy strawberries.',
    lost: 'Let’s grow again!',
    picker: 'Pick your garden.',
  };
  text('dialog-title', titles[mode]);
  const descriptions = {
    welcome: 'Cheeky snails want our strawberries! Grow a flower team and gently pop them back home.',
    pause: 'The snails are taking a break too. Your flowers and magic will be right here.',
    won: `${'★'.repeat(progress.stars[game.level])}  You sent ${game.sentHome} snails home! ${finalGarden ? 'All six gardens are safe. Play your favorites again!' : 'A new garden is waiting for you.'}`,
    lost: 'Those snails were speedy! Try more flowers near the path, and tap your glowing magic buttons. You can try as often as you like.',
    picker: 'Start with a sunny little garden. Each new garden opens when you finish the one before it. Picking a garden starts it again.',
  };
  text('dialog-text', descriptions[mode]);
  text('dialog-eyebrow', mode === 'won' ? 'HIP HIP, HOORAY!' : mode === 'lost' ? 'EVERY GARDENER GETS ANOTHER GO' : 'GARDEN GUARDIANS');
  text('dialog-primary', mode === 'welcome' ? (progress.unlocked ? 'Keep growing! →' : 'Let’s grow! →') :
    mode === 'pause' ? 'Keep playing →' :
    mode === 'won' ? (finalGarden ? 'Play again →' : 'Next garden →') :
    mode === 'lost' ? 'Try again →' : '← Back');
  text('dialog-secondary', mode === 'pause' ? 'Choose a garden · starts a new game' : 'Choose a garden · 6 little adventures');
  if (mode === 'picker') {
    const picker = element('level-picker');
    picker.replaceChildren();
    LEVELS.forEach((level, index) => {
      const button = document.createElement('button');
      button.disabled = index > progress.unlocked;
      button.textContent = button.disabled ? '🔒' : `${index + 1}`;
      button.setAttribute('aria-label', `Garden ${index + 1}: ${level.name}${button.disabled ? ', locked' : `, ${progress.stars[index]} stars`}`);
      const stars = document.createElement('small');
      stars.textContent = button.disabled ? 'Grow to unlock' : progress.stars[index] ? '★'.repeat(progress.stars[index]) : 'Let’s explore';
      button.append(stars);
      button.addEventListener('click', () => startGarden(index));
      picker.append(button);
    });
  }
  primary.focus();
}

primary.addEventListener('click', () => {
  if (dialog === 'welcome') startGarden(progress.unlocked);
  else if (dialog === 'pause') closeDialog();
  else if (dialog === 'lost') startGarden(game.level);
  else if (dialog === 'won') startGarden(game.level === LEVELS.length - 1 ? 0 : game.level + 1);
  else showDialog(pickerReturn);
});
secondary.addEventListener('click', () => {
  pickerReturn = dialog;
  showDialog('picker');
});
element('pause').addEventListener('click', () => showDialog('pause'));
element('sound').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  element('sound').setAttribute('aria-pressed', String(soundEnabled));
  element('sound').setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on');
  text('sound', soundEnabled ? '♪ On' : '♪ Off');
  if (soundEnabled) chime();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && overlay.hidden && game.phase === 'wave') showDialog('pause');
});
window.addEventListener('pagehide', () => {
  if (overlay.hidden && game.phase === 'wave') showDialog('pause');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (overlay.hidden) showDialog('pause');
    else if (dialog === 'pause') closeDialog();
  }
  if (event.key !== 'Tab' || overlay.hidden) return;
  const focusable = Array.from(overlay.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')).filter(node => !node.hidden && node.getClientRects().length);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

const shopButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-flower]'));
shopButtons.forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.flower as Flower;
  selectedPad = null;
  hint(`Tap a + patch to plant ${FLOWERS[selected].name}.`);
  sync();
}));
const padButtons = PADS.map((position, index) => {
  const button = document.createElement('button');
  button.className = 'pad';
  button.style.left = `${position.x / 10}%`;
  button.style.top = `${position.y / 6.4}%`;
  const symbol = document.createElement('span');
  symbol.className = 'plant-symbol';
  symbol.setAttribute('aria-hidden', 'true');
  const number = document.createElement('span');
  number.className = 'pad-number';
  number.textContent = String(index + 1);
  number.setAttribute('aria-hidden', 'true');
  button.append(symbol, number);
  button.addEventListener('click', () => {
    if (game.towers.some(tower => tower.pad === index)) {
      selectedPad = selectedPad === index ? null : index;
    } else if (game.plant(index, selected)) {
      chime(480);
      selectedPad = null;
      hint(game.towers.length === 1 && game.phase === 'build' ? 'Lovely! Plant more flowers, or tap Let’s go!' : 'A new friend! Flowers pop bubbles all by themselves.');
    } else hint('Need more sun coins? Move a flower to get all its coins back.');
    sync();
  });
  element('pads').append(button);
  return button;
});
element('remove-tower').addEventListener('click', () => {
  if (selectedPad !== null) {
    const tower = game.towers.find(item => item.pad === selectedPad);
    if (tower) selected = tower.kind;
    const pad = selectedPad;
    game.remove(pad);
    selectedPad = null;
    sync();
    padButtons[pad].focus();
    hint('All your coins are back! Tap a + patch to plant again.');
  }
});
element('close-tower').addEventListener('click', () => {
  const pad = selectedPad;
  selectedPad = null;
  sync();
  if (pad !== null) padButtons[pad].focus();
});
element('start-wave').addEventListener('click', () => {
  if (game.startWave()) {
    selectedPad = null;
    hint('Here come the snails! Your flowers will take care of them.');
    chime(520);
    sync();
  }
});
for (const power of ['rainbow', 'freeze'] as Power[]) {
  element(power).addEventListener('click', () => {
    if (!game.usePower(power)) return;
    chime(power === 'rainbow' ? 880 : 440);
    text('power-banner', power === 'rainbow' ? '🌈 Rainbow pop! Home you go, snails!' : '❄ Snow cloud! Slow and snowy for 8 seconds.');
    bannerUntil = performance.now() + 3200;
    sync();
  });
}

function sync() {
  const settings = LEVELS[game.level];
  text('level-number', `GARDEN ${String(game.level + 1).padStart(2, '0')} / 06`);
  text('level-name', settings.name);
  text('hearts', String(game.hearts));
  text('coins', String(game.coins));
  text('wave', `${Math.min(settings.waves, game.wave + (game.phase === 'build' ? 1 : 0))} / ${settings.waves}`);
  shopButtons.forEach(button => {
    const kind = button.dataset.flower as Flower;
    const flower = FLOWERS[kind];
    const locked = game.level < flower.unlock;
    button.disabled = locked || game.coins < flower.cost;
    button.classList.toggle('selected', selected === kind);
    button.setAttribute('aria-pressed', String(selected === kind));
    const price = button.querySelector('.price')!;
    const label = locked ? `Garden ${flower.unlock + 1}` : `☀ ${flower.cost}`;
    if (price.textContent !== label) price.textContent = label;
    button.setAttribute('aria-label', `${flower.name}, ${locked ? `unlocks in garden ${flower.unlock + 1}` : `${flower.cost} sun coins`}`);
  });
  padButtons.forEach((button, index) => {
    const tower = game.towers.find(item => item.pad === index);
    button.classList.toggle('planted', !!tower);
    button.classList.toggle('focused', selectedPad === index);
    button.dataset.kind = tower?.kind || '';
    const symbol = button.querySelector('.plant-symbol')!;
    const label = tower ? FLOWERS[tower.kind].icon : '+';
    if (symbol.textContent !== label) symbol.textContent = label;
    button.setAttribute('aria-label', tower ? `Patch ${index + 1}: ${FLOWERS[tower.kind].name}. Show range or move flower.` : `Patch ${index + 1}: plant ${FLOWERS[selected].name} for ${FLOWERS[selected].cost} sun coins.`);
    button.disabled = !tower && game.coins < FLOWERS[selected].cost;
  });
  const currentTower = game.towers.find(item => item.pad === selectedPad);
  element('tower-actions').hidden = !currentTower;
  if (currentTower) text('tower-name', FLOWERS[currentTower.kind].name);
  const start = element<HTMLButtonElement>('start-wave');
  start.disabled = game.phase !== 'build' || !game.towers.length;
  text('start-wave', game.phase === 'wave' ? 'Growing strong…' : game.wave > 0 ? 'Next wave →' : 'Let’s go! →');
  text('wave-note', game.phase === 'wave' ? 'Flowers fire all by themselves.' : game.towers.length ? 'Ready when you are. No rush!' : 'Plant a flower to start.');
  for (const power of ['rainbow', 'freeze'] as Power[]) {
    const ready = game.ready(power);
    const usable = ready && game.phase === 'wave' && game.snails.length > 0;
    const button = element<HTMLButtonElement>(power);
    button.disabled = !usable;
    button.classList.toggle('ready', usable);
    const status = usable ? 'READY! Tap me! ✦' : ready ? 'Ready for the next snails' :
      game.phase === 'wave' ? `Ready in ${Math.ceil(game.cooldown[power] - game.charge[power])}s` : 'Charges during each wave';
    text(`${power}-status`, status);
    element(`${power}-charge`).style.width = `${game.charge[power] / game.cooldown[power] * 100}%`;
  }
}

let previousTime = performance.now();
let lastUi = 0;
function frame(now: number) {
  const dt = Math.min((now - previousTime) / 1000, 0.1);
  previousTime = now;
  if (!isPaused) {
    const oldPhase = game.phase;
    const oldPops = game.sentHome;
    const readyBefore = game.ready('rainbow') || game.ready('freeze');
    game.update(dt);
    gameTime += dt;
    if (game.sentHome > oldPops) chime(680);
    if (!readyBefore && (game.ready('rainbow') || game.ready('freeze'))) chime(1040);
    if (game.phase !== oldPhase) {
      if (game.phase === 'won') {
        const stars = game.hearts >= 7 ? 3 : game.hearts >= 4 ? 2 : 1;
        progress.stars[game.level] = Math.max(progress.stars[game.level], stars);
        progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length - 1, game.level + 1));
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch { /* Progress remains available for this session. */ }
        showDialog('won');
        chime(950);
      } else if (game.phase === 'lost') showDialog('lost');
      else if (game.phase === 'build') hint('Great growing! +35 sun coins. Plant more friends, then start the next wave.', 10);
      sync();
    }
    if (now >= bannerUntil) {
      const readyPower = (['rainbow', 'freeze'] as Power[]).find(power => game.ready(power));
      text('power-banner', readyPower && game.phase === 'wave' && game.snails.length > 0 ?
        (readyPower === 'rainbow' ? '🌈 Rainbow pop is ready! Tap the glowing button →' : '❄ Snow cloud is ready! Tap the glowing button →') : '');
    }
    if (now >= hintUntil) text('hint', game.phase === 'build' ? 'Pick a flower, then tap a + patch. No rush!' : 'Watch for glowing magic! Tap a flower to see its reach.');
  }
  if (now - lastUi > 100) { sync(); lastUi = now; }
  render(game, reducedMotion.matches ? 0 : gameTime, selectedPad);
  requestAnimationFrame(frame);
}
sync();
showDialog('welcome');
requestAnimationFrame(frame);
