import { GameMode, Leaderboard } from "./leaderboard";
import Settings from "./models/settings";
import { SheetClient } from "./sheetClient";

export default async function updateLeaderboard(settings: Settings, score: string, mode: GameMode) {
  console.log('Updating spreadsheet:', settings);
  chrome.identity.getAuthToken({ interactive: true }, async (token) => {
    console.log('Token: ', token);

    const client = new SheetClient(token, settings.sheetId);
    const leaderboard = new Leaderboard(client, settings.teamName, mode);

    try {
      await leaderboard.inputScore(score);
    } catch (e) {
      console.log('Error:', e);
    }
  });
}
