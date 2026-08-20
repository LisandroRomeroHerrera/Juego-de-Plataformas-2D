const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let bgmTimer = null;
let bgmStep = 0;

const MARIO_THEME = [
    {n: 659, d: 140}, {n: 659, d: 140}, {n: 0, d: 140}, {n: 659, d: 140},
    {n: 0, d: 140}, {n: 523, d: 140}, {n: 659, d: 140}, {n: 0, d: 140},
    {n: 784, d: 280}, {n: 0, d: 280}, {n: 392, d: 280}, {n: 0, d: 280},
    {n: 523, d: 220}, {n: 0, d: 90},  {n: 392, d: 220}, {n: 0, d: 90},
    {n: 330, d: 220}, {n: 0, d: 90},  {n: 440, d: 180}, {n: 494, d: 180},
    {n: 466, d: 140}, {n: 440, d: 180}, {n: 392, d: 180}, {n: 659, d: 180},
    {n: 784, d: 180}, {n: 880, d: 180}, {n: 698, d: 140}, {n: 784, d: 140},
    {n: 0, d: 90},   {n: 659, d: 180}, {n: 523, d: 140}, {n: 587, d: 140},
    {n: 494, d: 180}, {n: 0, d: 180}
];

export function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
}

export function playBGMNote(isGameStatePlaying) {
    if (!audioCtx || !isGameStatePlaying) return;
    const note = MARIO_THEME[bgmStep];
    if (note.n > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note.n, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (note.d / 1000) * 0.9);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + note.d / 1000);
    }
    bgmStep = (bgmStep + 1) % MARIO_THEME.length;
    bgmTimer = setTimeout(() => playBGMNote(isGameStatePlaying), note.d);
}

export function startBGM(isGameStatePlaying) {
    stopBGM();
    bgmStep = 0;
    playBGMNote(isGameStatePlaying);
}

export function stopBGM() {
    if (bgmTimer) clearTimeout(bgmTimer);
}

export function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987, now);
        osc.frequency.setValueAtTime(1318, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'pipe') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'powerup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(820, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'hit') {
        stopBGM();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'win') {
        stopBGM();
        osc.type = 'square';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(783, now + 0.2);
        osc.frequency.setValueAtTime(1046, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
}