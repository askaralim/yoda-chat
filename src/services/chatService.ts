// Handle full RAG logic (retrieve + LLM answer)

import { answerUserQuery } from './llmService.js';
import { ConversationMessage, ConversationHistory } from '../types/chatbot.js';
import { redisClient, ensureRedisConnected } from './cacheService.js';

export class ChatbotAgent {
  /**
   * Process a user message and return an AI-generated response
   * @param message - The user's message/question
   * @param userId - Unique identifier for the user
   * @returns Promise<string> - The AI-generated response
   */
  async processMessage(message: string, userId: string): Promise<string> {
    try {
      await ensureRedisConnected();

      // Get or create conversation history for this user
      const history = await redisClient.lRange(`conversation:${userId}`, 0, 9) as string[];

      // Add user message to history
      await redisClient.lPush(`conversation:${userId}`, JSON.stringify({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }));

      // Build conversation context with history (last 10 messages for context)
      const messages = history.map((msg: string) => JSON.parse(msg) as ConversationMessage);

      // Get AI response from LLM service
      const aiResponse = await answerUserQuery(message);

      // Add AI response to history
      await redisClient.lPush(`conversation:${userId}`, JSON.stringify({
        role: 'assistant',
        message: aiResponse,
        timestamp: new Date().toISOString()
      }));

      // Keep conversation history manageable (last 50 messages)
      if (history.length > 50) {
        await redisClient.lTrim(`conversation:${userId}`, 0, 49);
      }

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
  async getConversationHistory(userId: string): Promise<ConversationMessage[]> {
    await ensureRedisConnected();
    const history = await redisClient.lRange(`conversation:${userId}`, 0, -1) as string[];
    return history.map((msg: string) => JSON.parse(msg) as ConversationMessage);
  }

  /**
   * Clear conversation history for a user
   * @param userId - Unique identifier for the user
   */
  async clearHistory(userId: string): Promise<void> {
    await ensureRedisConnected();
    await redisClient.del(`conversation:${userId}`);
  }
}

export const chatbotAgent = new ChatbotAgent();
