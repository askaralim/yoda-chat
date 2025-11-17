// Handle full RAG logic (retrieve + LLM answer)

import { answerUserQuery } from './llmService.js';
import { ConversationMessage, ConversationHistory } from '../types/chatbot.js';
import { redisClient, ensureRedisConnected } from './cacheService.js';
import { logger } from '../utils/logger.js';

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

      // Build conversation context with history (last 10 messages for context)
      const messages = history.map((msg: string) => JSON.parse(msg) as ConversationMessage);

      // Get AI response from LLM service
      const aiResponse = await answerUserQuery(userId, message, messages.map((m) => ({
        role: m.role,
        content: m.message,
      })));

      // Add user message to history
      await redisClient.lPush(`conversation:${userId}`, JSON.stringify({
        role: 'user',
        message: message,
        timestamp: new Date().toISOString()
      }));

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

      const responseText = aiResponse || 'Sorry, I am unable to answer that question.';
      logger.debug("Chatbot agent processed message", {
        userId,
        messagePreview: message.slice(0, 80),
      });
      return responseText;
    } catch (error) {
      logger.error('Error in chatbot agent', error);
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
    logger.debug("Chatbot history retrieved from Redis", { userId, count: history.length });
    return history.map((msg: string) => JSON.parse(msg) as ConversationMessage);
  }

  /**
   * Clear conversation history for a user
   * @param userId - Unique identifier for the user
   */
  async clearHistory(userId: string): Promise<void> {
    await ensureRedisConnected();
    await redisClient.del(`conversation:${userId}`);
    logger.info("Chatbot history cleared", { userId });
  }
}

export const chatbotAgent = new ChatbotAgent();
