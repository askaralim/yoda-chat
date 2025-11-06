// Handle full RAG logic (retrieve + LLM answer)

import { answerUserQuery } from './llmService.js';
import { ConversationMessage } from '../types/chatcompletion.js';

export class ChatbotAgent {
  private conversations: Map<string, ConversationMessage[]>;

  constructor() {
    // In-memory conversation history (consider using Redis or database for production)
    this.conversations = new Map();
  }

  /**
   * Process a user message and return an AI-generated response
   * @param message - The user's message/question
   * @param userId - Unique identifier for the user
   * @returns Promise<string> - The AI-generated response
   */
  async processMessage(message: string, userId: string): Promise<string> {
    try {
      // Get or create conversation history for this user
      //   if (!this.conversations.has(userId)) {
      //     this.conversations.set(userId, []);
      //   }

      //   const history = this.conversations.get(userId)!;

      //   // Add user message to history
      //   history.push({
      //     role: 'user',
      //     content: message,
      //     timestamp: new Date().toISOString()
      //   });

      //   // Build conversation context with history (last 10 messages for context)
      //   const recentHistory = history.slice(-10);
      //   const messages = recentHistory.map(msg => ({
      //     role: msg.role,
      //     content: msg.content
      //   }));

      // Get AI response from LLM service
      const aiResponse = await answerUserQuery(message);

      //   // Add AI response to history
      //   history.push({
      //     role: 'assistant',
      //     content: aiResponse,
      //     timestamp: new Date().toISOString()
      //   });

      //   // Keep conversation history manageable (last 50 messages)
      //   if (history.length > 50) {
      //     this.conversations.set(userId, history.slice(-50));
      //   }

      return aiResponse || 'Sorry, I am unable to answer that question.';
    } catch (error) {
      console.error('Error in chatbot agent:', error);
      throw error;
    }
  }

  /**
   * Get conversation history for a user
   * @param userId - Unique identifier for the user
   * @returns Array of conversation messages
   */
  getConversationHistory(userId: string): ConversationMessage[] {
    return this.conversations.get(userId) || [];
  }

  /**
   * Clear conversation history for a user
   * @param userId - Unique identifier for the user
   */
  clearHistory(userId: string): void {
    this.conversations.delete(userId);
  }
}

export const chatbotAgent = new ChatbotAgent();
