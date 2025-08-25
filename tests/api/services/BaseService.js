import { expect } from '@playwright/test';

export class BaseService {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;
  }

  async makeRequest(method, endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.request[method.toLowerCase()](url, options);
    return response;
  }

  async validateResponse(response, expectedStatus = 200) {
    expect(response.status()).toBe(expectedStatus);
    return response;
  }

  async validateResponseTime(response, maxTime = 3000) {
    const responseTime = response.request().timing().responseEnd - response.request().timing().requestStart;
    expect(responseTime).toBeLessThan(maxTime);
  }
}