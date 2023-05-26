import ApiClient from "./apiClient";
import { Sheet } from "./spreadsheetClient";

type MajorDimension = "ROWS" | "COLUMNS";

interface RangeResponse {
  range: string
  majorDimension: MajorDimension,
  values: string[][] | number[][]
}

interface Cell {
  row: number;
  column: number;
}

interface Range {
  start: Cell;
  end: Cell;
}

interface Color {
  red: number;
  green: number;
  blue: number;
}

export class SheetClient {
  public title = '';
  public sheetId = 0;

  constructor(private apiClient: ApiClient, sheet: Sheet) {
    this.title = sheet.properties.title;
    this.sheetId = sheet.properties.sheetId;
  }

  public async getRange(range: string): Promise<RangeResponse> {
    const sheetRange = `${this.title}!${range}`;
    const response = await this.apiClient.get(`/values/${sheetRange}`);
    return (await response.json()) as RangeResponse;
  }

  public async getCell(cell: string): Promise<string | null> {
    const range = await this.getRange(`${cell}:${cell}`);
    if ((range.values?.length ?? 0) === 0) {
      return null;
    }
    return range.values[0][0] as string;
  }

  public async createRow(index: number): Promise<void> {
    const response = await this.apiClient.post(':batchUpdate', {
      requests:[
        {
          insertDimension: {
            range: {
              sheetId: this.sheetId,
              dimension: 'ROWS',
              startIndex: index,
              endIndex: index + 1,
            }
          },
        },
      ],
    });
  }

  public async editCell(cell: string, value: string | number): Promise<Response> {
    const endpoint = `/values/${this.title}!${cell}:${cell}?valueInputOption=RAW`;
    return await this.apiClient.put(endpoint, {
      values: [[value]],
    });
  }

  public async setCellOrRangeColor(cellOrRange: Cell | Range, color: Color): Promise<Response> {
    const cellOrRangeObject = 'row' in cellOrRange
      ? {
        start: {
          sheetId: this.sheetId,
          rowIndex: cellOrRange.row,
          columnIndex: cellOrRange.column,
        }
      }
      : {
        range: {
          sheetId: this.sheetId,
          startRowIndex: cellOrRange.start.row,
          endRowIndex: cellOrRange.end.row,
          startColumnIndex: cellOrRange.start.column,
          endColumnIndex: cellOrRange.end.column,
        }
      };
    
    return await this.apiClient.post(':batchUpdate', {
      requests:[
        {
          updateCells: {
            rows: [
              {
                values: [
                  {
                    userEnteredFormat: {
                      backgroundColor: color,
                    },
                  },
                ],
              }
            ],
            fields: 'userEnteredFormat.backgroundColor',
            ...cellOrRangeObject,
          },
        },
      ],
    });
  }
}
