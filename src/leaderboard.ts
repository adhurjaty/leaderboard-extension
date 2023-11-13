import { SheetClient } from "./sheets/sheetClient";
import { scoreboard } from "./utils";

export interface TeamResult {
  teamName: string;
  score: Score | null;
}
export interface Score {
  time: number;
  guesses: number;
}

interface Color {
  red: number;
  green: number;
  blue: number;
}

const BLANK_COLOR = {
  red: 1,
  green: 1,
  blue: 1,
};

const SOLID_WIN_COLOR = {
  red: 1,
  green: 229 / 255,
  blue: 153 / 255,
};

const TIME_WIN_COLOR = {
  red: 201 / 255,
  green: 218 / 255,
  blue: 248 / 255,
};

const GUESS_WIN_COLOR = {
  red: 234 / 255,
  green: 209 / 255,
  blue: 220 / 255,
};

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

  public async setWinningColors(results: TeamResult[]): Promise<void> {
    const row = await this.getStartIndex();
    if (!row) {
      return;
    }

    const teams = await this.getTeams();
    const teamsPlayed = results.filter(team => team.score !== null);

    const winners = scoreboard(teamsPlayed);

    // clear existing colors
    await this.client.setCellOrRangeColor(
      {
        start: {
          row,
          column: 1,
        },
        end: {
          row: row + 1,
          column: teams.length + 2,
        }
      },
      BLANK_COLOR
    );

    const colorTeams = async (results: TeamResult[], color: Color) => {
      await Promise.allSettled(results.map(result => this.client.setCellOrRangeColor(
        {
          row,
          column: teams.findIndex(x => x === result.teamName) + 1
        },
        color
      )));
    }

    // set new colors
    if (winners && 'solid' in winners) {
      await colorTeams(winners.solid, SOLID_WIN_COLOR);
    }

    if (winners && 'time' in winners) {
      await Promise.allSettled(
        [
          colorTeams(winners.time, TIME_WIN_COLOR),
          colorTeams(winners.guesses, GUESS_WIN_COLOR)
        ]
      );
    }

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
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString()}`;
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
    const regex = /(?<guesses>\d+) guesses in (?:(?<minutes>\d+)m\s)?(?<seconds>\d+)?s/;
    const result = regex.exec(scoreString ?? '');
    if (!result) {
      return null;
    }
    const { minutes, seconds, guesses } = result.groups as { minutes?: string, seconds?: string, guesses: string };
    return {
      time: parseInt(minutes ?? '0') * 60 + parseInt(seconds ?? '0'),
      guesses: parseInt(guesses),
    };
  }

  private cellName(row: number, col: number): string {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  }
}
