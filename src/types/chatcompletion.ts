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
  index: number;
  message: {
    content: string;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call';
}

export interface ChatCompletionResponse {
  id: string;
  choices: ChatChoice[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
