import OpenAI from 'openai';
import { config } from './env.js';

export const openaiClient = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL,
  defaultHeaders: {
    'Authorization': `Bearer ${config.openai.apiKey}`,
      'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});