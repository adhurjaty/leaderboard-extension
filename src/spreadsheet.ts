import { Leaderboard } from "./leaderboard";
import GameMode from "./models/gameMode";
import { SpreadsheetClient } from "./sheets/spreadsheetClient";

export default async function updateLeaderboard(client: SpreadsheetClient, teamName: string, score: string, mode: GameMode) {
  const sheetClient = client.getSheet(mode);
  if (!sheetClient) {
    throw new Error(`Could not find sheet for mode ${mode}`);
  }

  const leaderboard = new Leaderboard(sheetClient, teamName);

  await leaderboard.inputScore(score);
}
