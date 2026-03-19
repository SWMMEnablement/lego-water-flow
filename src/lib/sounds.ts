const ctx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

export const playBonk = () => {
  const ac = ctx();
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
};

export const playWhoosh = () => {
  const ac = ctx();
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
};
