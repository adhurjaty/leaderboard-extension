import ApiClient from "./apiClient";
import { SheetClient } from "./sheetClient";

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

interface ErrorResponse {
  error: {
    code: number,
    message: string,
    status: string,
  };
}


export class SpreadsheetClient {
  static async create(apiClient: ApiClient): Promise<SpreadsheetClient> {
    const sheetResponse = await apiClient.get('/')
      .then(response => response.json() as Promise<SheetResponse | ErrorResponse>);

    if ((sheetResponse as ErrorResponse).error) {
      throw new Error('Could not find spreadsheet');
    }

    return new SpreadsheetClient(apiClient, (sheetResponse as SheetResponse).sheets);
  }

  private sheetClients: SheetClient[] = [];

  private constructor(apiClient: ApiClient, sheets: Sheet[]) {
    this.sheetClients = sheets.map(sheet => new SheetClient(apiClient, sheet));
  }

  getSheet(sheetTitle: string) {
    return this.sheetClients.find(sheet => sheet.title === sheetTitle);
  }
}