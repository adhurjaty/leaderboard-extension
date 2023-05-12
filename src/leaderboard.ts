import { SheetClient } from "./sheets/sheetClient";

export interface TeamResult {
  teamName: string;
  score: Score | null;
}
export interface Score {
  time: number;
  guesses: number;
}

export class Leaderboard {
  constructor(private client: SheetClient, private teamName: string) { }

  public async inputScore(score: string) {
    const rowIndex = await this.getOrCreateRow();
    await this.editScoreCell(rowIndex, score);
  }

  public async getScores(): Promise<TeamResult[]> {
    const startRowIdx = await this.getStartIndex();
    if (!startRowIdx) {
      return [];
    }

    return (await Promise.all((await this.getTeams())
      .map(async (team, idx) => {
        const cellName = this.cellName(startRowIdx, idx + 1);
        const cell = await this.client.getCell(cellName);
        return {
          teamName: team,
          score: this.convertToScore(cell),
        };
      })));
  }

  private async getOrCreateRow(): Promise<number> {
    const startIndex = await this.getStartIndex() ?? 3;
    const cellName = this.cellName(startIndex, 0);

    const cell = await this.client.getCell(cellName);

    if (cell && this.isToday(cell)) {
      return startIndex;
    }
    if (cell) {
      await this.client.createRow(startIndex);
    }
    await this.client.editCell(cellName, this.formatDate(new Date()));
    return startIndex;
  }

  private async getStartIndex(): Promise<number | null> {
    const rangeResponse = await this.client.getRange('A3:A5');
    const idx = rangeResponse.values
      ?.map((row) => row[0] as string)
      ?.findIndex(date => this.isToday(date))
      ?? -1;
    return idx === -1 ? null : idx + 2;
  }

  private isToday(cell: string): boolean {
    const today = new Date();
    return cell === this.formatDate(today);
  }

  private formatDate(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(2)}`;
  }

  private async editScoreCell(rowIndex: number, score: string): Promise<void> {
    const colIndex = await this.getTeamColIndex();
    const cellName = this.cellName(rowIndex, colIndex);

    await this.client.editCell(cellName, score);
  }

  private async getTeamColIndex(): Promise<number> {
    const teams = await this.getTeams();

    return teams.findIndex((team) =>
      (team as string).toLowerCase().startsWith(this.teamName.toLowerCase())) + 1;
  }

  private async getTeams(): Promise<string[]> {
    const { values } = await this.client.getRange('B2:Z2');
    return (values[0] as string[])
      .map((team) => {
        const match = team.match(/^(.*)\s*\(.*\)$/);
        return (match ? match[1] : team).trim();
      });
  }

  private convertToScore(scoreString: string | null): Score | null {
    const regex = /(?<guesses>\d+) guesses in (?:(?<minutes>\d+)m\s)?(?<seconds>\d+)s/;
    const result = regex.exec(scoreString ?? '');
    if (!result) {
      return null;
    }
    const { minutes, seconds, guesses } = result.groups as { minutes?: string, seconds: string, guesses: string };
    return {
      time: parseInt(minutes ?? '0') * 60 + parseInt(seconds),
      guesses: parseInt(guesses),
    };
  }

  private cellName(row: number, col: number): string {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  }
}
