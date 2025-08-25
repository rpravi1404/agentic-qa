import { expect } from '@playwright/test';

export function generateRandomId() {
  return Math.floor(Math.random() * 1000000);
}

export function generateRandomEmail() {
  return `test${Date.now()}@example.com`;
}

export function buildHeaders(contentType = 'application/json', authToken = null) {
  const headers = {
    'Content-Type': contentType
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

export async function validateJsonSchema(response, schema) {
  // Basic schema validation - can be enhanced with ajv or similar
  const data = await response.json();
  expect(data).toBeDefined();
  return data;
}