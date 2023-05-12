export default class ApiClient {
  constructor(private baseUrl: string, private token: string) { }

  async get(endpoint: string): Promise<Response> {
    return await fetch(this.url(endpoint), {
    method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
  }

  async post(endpoint: string, body: any): Promise<Response> {
    return await fetch(this.url(endpoint), {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
  }

  async put(endpoint: string, body: any): Promise<Response> {
    return await fetch(this.url(endpoint), {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })
  }

  private url(endpoint: string) {
    return this.baseUrl + endpoint;
  }
}