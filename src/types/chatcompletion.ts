export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens: number;
  // temperature: number;
  // stream: boolean;
}

export interface ChatChoice {
  message: {
    content: string;
  };
}

export interface ChatCompletionResponse {
  choices: ChatChoice[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
