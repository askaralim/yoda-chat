// Conversation repository - handles all database operations for chat conversations

import { FieldPacket, ResultSetHeader } from 'mysql2';
import { db } from '../config/db.js';
import { ChatConversation } from '../domain/types/chatConversations.js';
import { logger } from '../utils/logger.js';
import { CustomError } from '../middleware/errorHandler.js';

export class ConversationRepository {
  /**
   * Insert a new chat conversation into the database
   * @param conversation - Chat conversation data to insert
   * @returns Chat conversation with generated ID
   * @throws Error if database insertion fails
   */
  async insert(conversation: ChatConversation): Promise<ChatConversation> {
    try {
      const contextIdsJson = JSON.stringify(conversation.contextIds || []);
      const chunksJson = JSON.stringify(conversation.chunks || []);

      const [result] = (await db.query(
        'INSERT INTO chat_conversations (user_id, question, answer, context_ids, chunks, latency) VALUES (?, ?, ?, ?, ?, ?)',
        [
          conversation.userId,
          conversation.question,
          conversation.answer,
          contextIdsJson,
          chunksJson,
          conversation.latency,
        ]
      )) as [ResultSetHeader, FieldPacket[]];

      const insertId = result?.insertId;
      if (!insertId) {
        throw new Error('Failed to get insert ID from database');
      }

      return {
        ...conversation,
        id: insertId.toString(),
      };
    } catch (error) {
      logger.error('Failed to insert chat conversation', error);
      throw new CustomError(
        `Database insertion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Get a conversation by ID
   * @param id - Conversation ID
   * @returns Chat conversation if found
   * @throws CustomError if not found
   */
  async findById(id: string): Promise<ChatConversation> {
    try {
      const [rows] = (await db.query(
        'SELECT id, user_id, question, answer, context_ids, chunks, latency, created_at, updated_at FROM chat_conversations WHERE id = ?',
        [id]
      )) as [ChatConversation[], FieldPacket[]];

      if (!rows || rows.length === 0 || !rows[0]) {
        throw new CustomError('Conversation not found', 404);
      }

      const conversation = rows[0];
      return {
        ...conversation,
        contextIds: JSON.parse(conversation.contextIds as unknown as string) as string[],
        chunks: JSON.parse(conversation.chunks as unknown as string) as ChatConversation['chunks'],
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Failed to find conversation by ID', error);
      throw new CustomError(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Get all conversations for a user
   * @param userId - User ID
   * @param limit - Maximum number of conversations to return (default: 50)
   * @param offset - Number of conversations to skip (default: 0)
   * @returns Array of chat conversations
   */
  async findByUserId(userId: string, limit = 50, offset = 0): Promise<ChatConversation[]> {
    try {
      const [rows] = (await db.query(
        'SELECT id, user_id, question, answer, context_ids, chunks, latency, created_at, updated_at FROM chat_conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      )) as [ChatConversation[], FieldPacket[]];

      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map((conversation) => ({
        ...conversation,
        contextIds: JSON.parse(conversation.contextIds as unknown as string) as string[],
        chunks: JSON.parse(conversation.chunks as unknown as string) as ChatConversation['chunks'],
      }));
    } catch (error) {
      logger.error('Failed to find conversations by user ID', error);
      throw new CustomError(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Delete a conversation by ID
   * @param id - Conversation ID
   * @returns true if deleted, false if not found
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const [result] = (await db.query('DELETE FROM chat_conversations WHERE id = ?', [id])) as [
        ResultSetHeader,
        FieldPacket[],
      ];

      return (result?.affectedRows ?? 0) > 0;
    } catch (error) {
      logger.error('Failed to delete conversation', error);
      throw new CustomError(
        `Database deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }
}

export const conversationRepository = new ConversationRepository();
