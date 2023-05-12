import { Leaderboard } from "./leaderboard";
import Settings from "./models/settings";
import ApiClient from "./sheets/apiClient";
import { SpreadsheetClient } from "./sheets/spreadsheetClient";

export type GameMode = 'normal' | 'hard'

export default async function updateLeaderboard(settings: Settings, score: string, mode: GameMode) {
  chrome.identity.getAuthToken({ interactive: true }, async (token) => {
    const apiClient = new ApiClient(
      `https://sheets.googleapis.com/v4/spreadsheets/${settings.sheetId ?? ''}`,
      token
    );
    const client = await SpreadsheetClient.create(apiClient);
    const sheetClient = client.getSheet(mode);
    if (!sheetClient) {
      throw new Error(`Could not find sheet for mode ${mode}`);
    }

    const leaderboard = new Leaderboard(sheetClient, settings.teamName);

    await leaderboard.inputScore(score);
  });
}
