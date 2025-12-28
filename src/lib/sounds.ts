// Sound notification utilities using Web Audio API

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Achievement sound - triumphant chime
export const playAchievementSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create oscillators for a pleasant achievement sound
    const oscillators = [
      { freq: 523.25, start: 0, duration: 0.15 },     // C5
      { freq: 659.25, start: 0.1, duration: 0.15 },   // E5
      { freq: 783.99, start: 0.2, duration: 0.2 },    // G5
      { freq: 1046.50, start: 0.3, duration: 0.4 },   // C6 (final note)
    ];
    
    oscillators.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.3, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (error) {
    console.warn('Could not play achievement sound:', error);
  }
};

// Notification sound - simple ping
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

// Success sound - for correct answers
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (error) {
    console.warn('Could not play success sound:', error);
  }
};
