import { Request, Response } from 'express';
import { chatbotAgent } from '../services/chatService.js';
import { ChatbotRequest, ChatbotResponse, ConversationHistory } from '../types/chatbot.js';

export class ChatbotController {
  /**
   * Test endpoint for chatbot - accepts a question and returns an answer
   */
  async ask(req: Request, res: Response): Promise<void> {
    try {
      const { question, userId }: ChatbotRequest = req.body;

      if (!question) {
        res.status(400).json({
          error: 'Question is required'
        });
        return;
      }

      const userIdOrDefault = userId || 'anonymous';
      const answer = await chatbotAgent.processMessage(question, userIdOrDefault);

      const response: ChatbotResponse = {
        question,
        answer,
        userId: userIdOrDefault,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Error in chatbot ask:', error);
      res.status(500).json({
        error: 'Failed to process question',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get conversation history for a user
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          error: 'User ID is required'
        });
        return;
      }

      const history = chatbotAgent.getConversationHistory(userId);

      const response: ConversationHistory = {
        userId,
        history,
        count: history.length
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({
        error: 'Failed to get conversation history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const chatbotController = new ChatbotController();
