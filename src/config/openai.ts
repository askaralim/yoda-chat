import OpenAI from 'openai';
import { config } from './env.js';
import { ChatOpenAI } from '@langchain/openai';

// export const openaiClient = new OpenAI({
//   apiKey: config.openai.apiKey,
//   baseURL: config.openai.baseURL,
//   defaultHeaders: {
//     'Authorization': `Bearer ${config.openai.apiKey}`,
//       'Content-Type': 'application/json'
//   },
//   timeout: 30000 // 30 seconds timeout
// });


export const openaiClient = new ChatOpenAI({
  model: config.gpt.model,
  // temperature: parseFloat(config.gpt.temperature),
  openAIApiKey: config.openai.apiKey,
  configuration: {
    baseURL: config.openai.baseURL,
    defaultHeaders: {
      'Authorization': `Bearer ${config.openai.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
  },
});