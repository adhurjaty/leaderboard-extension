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


export class SpreadsheetClient {
  static async create(apiClient: ApiClient): Promise<SpreadsheetClient> {
    const sheetResponse = await apiClient.get('/')
      .then(response => response.json() as Promise<SheetResponse>);

    return new SpreadsheetClient(apiClient, sheetResponse.sheets);
  }

  private sheetClients: SheetClient[] = [];

  private constructor(apiClient: ApiClient, sheets: Sheet[]) {
    this.sheetClients = sheets.map(sheet => new SheetClient(apiClient, sheet));
  }

  getSheet(sheetTitle: string) {
    return this.sheetClients.find(sheet => sheet.title === sheetTitle);
  }
}