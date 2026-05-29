// Singleton AudioContext (browsers cap concurrent contexts ~6).
// Respects a localStorage "muted" flag so all SFX share one switch.

let _ctx: AudioContext | null = null;
const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    _ctx = new Ctor();
  }
  if (_ctx.state === "suspended") _ctx.resume().catch(() => {});
  return _ctx;
};

const MUTE_KEY = "lwfl:muted";
export const isMuted = (): boolean => {
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
};
export const setMuted = (v: boolean) => {
  try { localStorage.setItem(MUTE_KEY, v ? "1" : "0"); } catch { /* ignore */ }
};

const guard = (fn: (ac: AudioContext) => void) => {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  try { fn(ac); } catch { /* ignore */ }
};

export const playBonk = () => guard((ac) => {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.frequency.setValueAtTime(220, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.15);
  gain.gain.setValueAtTime(0.3, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
  osc.start();
  osc.stop(ac.currentTime + 0.2);
});

export const playWhoosh = () => guard((ac) => {
  const bufferSize = ac.sampleRate * 0.4;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const bandpass = ac.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.setValueAtTime(1000, ac.currentTime);
  bandpass.frequency.exponentialRampToValueAtTime(4000, ac.currentTime + 0.15);
  bandpass.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.4);
  bandpass.Q.value = 2;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ac.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
  noise.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ac.destination);
  noise.start();
  noise.stop(ac.currentTime + 0.4);
});

export const playCoin = () => guard((ac) => {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  const now = ac.currentTime;
  osc.type = "sine";
  osc.frequency.setValueAtTime(988, now);
  osc.frequency.setValueAtTime(1319, now + 0.06);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.start(now);
  osc.stop(now + 0.4);
});
