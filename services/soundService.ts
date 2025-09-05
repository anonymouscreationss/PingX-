import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class SoundService {
  private sounds: { [key: string]: Audio.Sound } = {};
  private isEnabled = true;

  async loadSounds() {
    if (Platform.OS === 'web') {
      // For web, we'll use Web Audio API
      return;
    }

    try {
      // Load ping success sound
      const { sound: successSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/ping-success.mp3')
      );
      this.sounds.success = successSound;

      // Load ping fail sound
      const { sound: failSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/ping-fail.mp3')
      );
      this.sounds.fail = failSound;

      // Load optimization sound
      const { sound: optimizeSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/optimize.mp3')
      );
      this.sounds.optimize = optimizeSound;
    } catch (error) {
      console.warn('Failed to load sounds:', error);
    }
  }

  async playSound(type: 'success' | 'fail' | 'optimize') {
    if (!this.isEnabled) return;

    if (Platform.OS === 'web') {
      // Web fallback using Web Audio API
      this.playWebSound(type);
      return;
    }

    try {
      const sound = this.sounds[type];
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  private playWebSound(type: 'success' | 'fail' | 'optimize') {
    // Create simple beep sounds for web
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different sound types
    const frequencies = {
      success: 800,
      fail: 300,
      optimize: 600
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

export const soundService = new SoundService();