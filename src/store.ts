import Settings from "./models/settings";

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get('settings');
  return result.settings as Settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  return chrome.storage.sync.set({ settings });
}
