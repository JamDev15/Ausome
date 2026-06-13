import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import apiClient from '../api/client';

export interface SpeakOptions {
  rate?: number;
  onDone?: () => void;
  onError?: () => void;
}

let currentSound: Audio.Sound | null = null;

// Remove emoji and non-speakable characters, keep readable text only
function cleanText(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27FF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[^\x20-\x7EÀ-ɏ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cacheKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_').slice(0, 60);
}

export async function prewarm(text: string): Promise<void> {
  const cleaned = cleanText(text ?? '');
  if (!cleaned) return;
  const key = cacheKey(cleaned);
  const fileUri = `${FileSystem.cacheDirectory}tts_${key}.mp3`;
  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists) return;
  try {
    const { data } = await apiClient.get('/tts/speak', {
      params: { text: cleaned },
      timeout: 30000,
    });
    await FileSystem.writeAsStringAsync(fileUri, data.audio, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    // silent — will download on demand when tapped
  }
}

export async function speak(text: string, options: SpeakOptions = {}) {
  const cleaned = cleanText(text ?? '');
  if (!cleaned) return;

  console.log('[TTS] speaking:', cleaned);

  try {
    if (currentSound) {
      await currentSound.stopAsync().catch(() => {});
      await currentSound.unloadAsync().catch(() => {});
      currentSound = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const key = cacheKey(cleaned);
    const fileUri = `${FileSystem.cacheDirectory}tts_${key}.mp3`;

    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) {
      const { data } = await apiClient.get('/tts/speak', {
        params: { text: cleaned },
        timeout: 30000,
      });
      await FileSystem.writeAsStringAsync(fileUri, data.audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
    console.log('[TTS] file size bytes:', (fileInfo as any).size);

    const { sound } = await Audio.Sound.createAsync({ uri: fileUri }, { shouldPlay: false });
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        currentSound = null;
        options.onDone?.();
      }
    });

    await sound.playAsync();
    console.log('[TTS] playAsync called for:', cleaned);

  } catch (e) {
    console.warn('[TTS] error:', e);
    options.onError?.();
  }
}
