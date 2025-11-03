import axios, { AxiosResponse } from 'axios';
import { ChatMessage, ChatCompletionRequest, ChatCompletionResponse } from '../types/chatcompletion.js';
import OpenAI from 'openai';
import { config } from '../config/env.js';

const openaiClient = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL
});

export async function chatCompletion(prompt: string) {
  const completion = await openaiClient.chat.completions.create({
    model: config.gpt.model,
    messages: [
      {
        role: 'system', 
        content: '你是Taklip的AI助手，请用简洁、专业的中文回答用户的问题。不要输出任何其他内容，只输出回答。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: parseInt(config.gpt.maxTokens),
  }, {
    headers: {
      'Authorization': `Bearer ${config.openai.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds timeout
  });

  return completion.choices[0]?.message.content;
}

// export class LLMService {
//   private baseURL: string;
//   private apiKey: string | undefined;
//   private model: string;
//   private maxTokens: number;
//   // private temperature: number;

//   constructor() {
//     this.baseURL = config.openai.baseURL;
//     this.apiKey = config.openai.apiKey;
//     this.model = config.gpt.model;
//     this.maxTokens = parseInt(config.gpt.maxTokens);
//     // this.temperature = parseFloat(process.env.TEMPERATURE || '0.7');

//     if (!this.apiKey) {
//       console.warn('⚠️  API2D_API_KEY is not set. GPT features will not work.');
//     }
//   }

//   /**
//    * Send a chat completion request to API2D
//    * @param messages - Array of message objects with role and content
//    * @returns Promise<string> - The AI-generated response content
//    */
//   async chatCompletion(messages: ChatMessage[]): Promise<string> {
//     if (!this.apiKey) {
//       throw new Error('API2D_API_KEY is not configured');
//     }

//     try {
//       // Add system message if not present (content-based chatbot context)
//       const systemMessage: ChatMessage = {
//         role: 'system',
//         content: '你是Taklip的内容助理，请用简洁、专业的中文回答用户的问题。不要输出任何其他内容，只输出回答。'
//       };

//       // Check if there's already a system message
//       const hasSystemMessage = messages.some(msg => msg.role === 'system');
//       const messagesWithSystem = hasSystemMessage ? messages : [systemMessage, ...messages];

//       const requestBody: ChatCompletionRequest = {
//         model: this.model,
//         messages: messagesWithSystem,
//         max_tokens: this.maxTokens,
//         // temperature: this.temperature,
//         // stream: false
//       };

//       const response: AxiosResponse<ChatCompletionResponse> = await openaiClient.chat.completions.create(
//         `${this.baseURL}/v1/chat/completions`,
//         requestBody,
//         {
//           headers: {
//             'Authorization': `Bearer ${this.apiKey}`,
//             'Content-Type': 'application/json'
//           },
//           timeout: 30000 // 30 seconds timeout
//         }
//       );

//       if (response.data && response.data.choices && response.data.choices.length > 0) {
//         const choice = response.data.choices[0];
//         if (choice && choice.message) {
//           return choice.message.content.trim();
//         }
//       }
//       throw new Error('Invalid response format from API2D');
//     } catch (error: any) {
//       console.error('API2D API error:', error.response?.data || error.message);
      
//       if (error.response?.status === 401) {
//         throw new Error('Invalid API key. Please check your API2D_API_KEY.');
//       } else if (error.response?.status === 429) {
//         throw new Error('Rate limit exceeded. Please try again later.');
//       } else if (error.code === 'ECONNABORTED') {
//         throw new Error('Request timeout. The API took too long to respond.');
//       } else {
//         throw new Error(`API2D API error: ${error.response?.data?.error?.message || error.message}`);
//       }
//     }
//   }

//   /**
//    * Test the API2D connection
//    * @returns Promise<boolean> - True if connection is successful
//    */
//   async testConnection(): Promise<boolean> {
//     try {
//       await this.chatCompletion([
//         { role: 'user', content: 'Say "OK" if you can hear me.' }
//       ]);
//       return true;
//     } catch (error) {
//       console.error('API2D connection test failed:', error instanceof Error ? error.message : 'Unknown error');
//       return false;
//     }
//   }
// }

// export const llmService = new LLMService();