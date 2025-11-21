// Handle full RAG logic (retrieve + LLM answer)

import { answerUserQuery } from './llmService.js';
import { ConversationMessage } from '../domain/types/chatbot.js';
import { redisClient, ensureRedisConnected } from './cacheService.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

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

      const key = `conversation:${userId}`;

      // Get last 10 messages for context
      // LPUSH adds to left (index 0), so newest is at 0, oldest at end
      // LRANGE 0 9 gets first 10 (newest), then reverse to get chronological order (oldest first)
      const historyStrings = (await redisClient.lRange(key, 0, 9)) as string[];
      const historyMessages: ConversationMessage[] = historyStrings
        .map((msg) => JSON.parse(msg) as ConversationMessage)
        .reverse(); // Reverse to get chronological order (oldest first) for LLM context

      // Get AI response from LLM service
      const aiResponse = await answerUserQuery(userId, message, historyMessages);

      // Append user message and assistant response (O(1) operations)
      await redisClient.lPush(
        key,
        JSON.stringify({
          role: 'user',
          message: message,
          timestamp: new Date().toISOString(),
        })
      );

      await redisClient.lPush(
        key,
        JSON.stringify({
          role: 'assistant',
          message: aiResponse,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(aiResponse),
        })
      );

      // Keep only last 50 messages (efficient with LTRIM)
      await redisClient.lTrim(key, 0, 49);

      // Set/refresh expiration
      await redisClient.expire(key, Number(config.conversation.conversationTtlSeconds));

      const responseText = aiResponse || 'Sorry, I am unable to answer that question.';
      logger.debug('Chatbot agent processed message', {
        userId,
        messagePreview: message.slice(0, 80),
      });
      return responseText;
    } catch (error) {
      logger.error('Error in chatbot agent', error);
      throw error;
    }
  }

  private calculateConfidence(answer: string): number {
    if (answer.includes('没有相关信息') || answer.includes('知识库中没有')) {
      return Number(config.conversation.confidenceThresholds.LOW);
    }
    if (answer.includes('根据Taklip知识库') || answer.includes('推荐')) {
      return Number(config.conversation.confidenceThresholds.HIGH);
    }
    return Number(config.conversation.confidenceThresholds.MEDIUM);
  }

  /**
   * Get conversation history for a user
   * @param userId - Unique identifier for the user
   * @returns Array of conversation messages
   */
  async getConversationHistory(userId: string): Promise<ConversationMessage[]> {
    await ensureRedisConnected();
    const key = `conversation:${userId}`;

    // Get all messages from list (LRANGE 0 -1 gets all)
    const historyStrings = (await redisClient.lRange(key, 0, -1)) as string[];

    if (historyStrings.length === 0) {
      logger.debug('No conversation history found', { userId });
      return [];
    }

    // Refresh expiration when history is accessed (user is active)
    await redisClient.expire(key, Number(config.conversation.conversationTtlSeconds));

    // Parse JSON strings to ConversationMessage objects
    // Note: List stores in reverse order (newest first), so reverse to get chronological order
    const history = historyStrings.map((msg) => JSON.parse(msg) as ConversationMessage).reverse(); // Reverse to get chronological order (oldest first)

    logger.debug('Chatbot history retrieved from Redis', { userId, count: history.length });
    return history;
  }

  /**
   * Clear conversation history for a user
   * @param userId - Unique identifier for the user
   */
  async clearHistory(userId: string): Promise<void> {
    await ensureRedisConnected();
    await redisClient.del(`conversation:${userId}`);
    logger.info('Chatbot history cleared', { userId });
  }
}

export const chatbotAgent = new ChatbotAgent();
