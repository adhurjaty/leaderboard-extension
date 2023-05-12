import { SheetClient } from "./sheets/sheetClient";

export class Leaderboard {
  private teams: string[] = [];

  constructor(private client: SheetClient, private teamName: string) {

  }

  public async inputScore(score: string) {
    const rowIndex = await this.possiblyCreateRow();
    await this.editScoreCell(rowIndex, score);
  }

  private async possiblyCreateRow(): Promise<number> {
    const startIndex = await this.getStartIndex() ?? 2;
    const cellName = this.cellName(startIndex, 0);

    const cell = await this.client.getCell(cellName);
    console.log(cell);
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
    const { values } = await this.client.getRange('B2:Z2');

    return values[0].findIndex((team) =>
      (team as string).toLowerCase().startsWith(this.teamName.toLowerCase())) + 1;
  }

  private cellName(row: number, col: number): string {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  }
}
