
type MajorDimension = "ROWS" | "COLUMNS";

export interface Sheet {
  properties: {
    index: number,
    sheetId: number,
    sheetType: string,
    title: string,
  }
}

interface SheetResponse {
  sheets: Sheet[]
}

interface RangeResponse {
  range: string
  majorDimension: MajorDimension,
  values: string[][] | number[][]
}

export class SheetClient {
  private baseUrl = '';

  constructor(private token: string, sheetId: string) {
    this.baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  }

  public async getSheet(): Promise<SheetResponse> {
    const url = this.baseUrl
    const response = await this.get(url);
    return (await response.json()) as SheetResponse;
  }

  public async getRange(range: string): Promise<RangeResponse> {
    const url = `${this.baseUrl}/values/${range}`;
    const response = await this.get(url);
    return (await response.json()) as RangeResponse;
  }

  public async getCell(sheet: string, cell: string): Promise<string | null> {
    const range = await this.getRange(`${sheet}!${cell}:${cell}`);
    if ((range.values?.length ?? 0) === 0) {
      return null;
    }
    return range.values[0][0] as string;
  }

  public async createRow(sheetId: number, index: number): Promise<void> {
    const url = `${this.baseUrl}:batchUpdate`;
    const response = await this.post(url, {
      requests:[
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: index,
              endIndex: index + 1,
            }
          },
        },
      ],
    });
  }

  public async editCell(sheet: string, cell: string, value: string | number): Promise<Response> {
    const url = `${this.baseUrl}/values/${sheet}!${cell}:${cell}?valueInputOption=RAW`;
    return await this.put(url, {
      values: [[value]],
    });
  }

  private async get(url: string): Promise<Response> {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
  }

  private async post(url: string, body: any): Promise<Response> {
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
  }

  private async put(url: string, body: any): Promise<Response> {
    return await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
  }
}
