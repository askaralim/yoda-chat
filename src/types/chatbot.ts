export interface ChatbotRequest {
  question: string;
  userId?: string;
}

export interface ChatbotResponse {
  question: string;
  answer: string;
  userId: string;
  timestamp: string;
}

export interface ConversationHistory {
  userId: string;
  history: ConversationMessage[];
  count: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
}
