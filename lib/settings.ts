/**
 * Settings — on-device preferences, AsyncStorage-backed.
 * Display name, home airport, and default aircraft pre-fill new entries;
 * currency reminders drive the due-date warnings on the Currency tab.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  displayName: string;
  homeAirport: string;
  defaultAircraftType: string;
  currencyReminders: boolean;
  notificationsEnabled: boolean;
}

const KEY = 'flightjournal:settings:v1';

export const DEFAULT_SETTINGS: Settings = {
  displayName: '',
  homeAirport: '',
  defaultAircraftType: '',
  currencyReminders: true,
  notificationsEnabled: true,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(next: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Best-effort — the in-memory copy still works for this session.
  }
}
