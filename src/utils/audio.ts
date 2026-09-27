/**
 * High quality Web Audio API sound synthesizer
 * Zero external audio files required, ultra-reliable across all environments
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundType = 'chime' | 'digital' | 'gong' | 'soft';

export function playSound(type: SoundType = 'chime', volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    if (type === 'chime') {
      // 3-tone ascending pleasant melodic chime (E5, G#5, B5)
      const freqs = [659.25, 830.61, 987.77];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0, now + idx * 0.16);
        gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.16 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 1.2);
      });
    } else if (type === 'digital') {
      // Modern clean dual beep
      [880, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.15 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.12);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.13);
      });
    } else if (type === 'gong') {
      // Deep resonant harmonic bell/gong
      const freqs = [220, 440, 554.37, 659.25];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const initGain = 0.4 / (i + 1);
        gain.gain.setValueAtTime(initGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2.6);
      });
    } else if (type === 'soft') {
      // Single gentle marimba tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.85);
    }
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}
