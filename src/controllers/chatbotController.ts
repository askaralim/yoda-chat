import { Request, Response, NextFunction } from 'express';
import { chatbotAgent } from '../services/chatService.js';
import { ChatbotRequest, ChatbotResponse, ConversationHistory } from '../types/chatbot.js';
import { CustomError } from '../middleware/errorHandler.js';

export class ChatbotController {
  /**
   * Test endpoint for chatbot - accepts a question and returns an answer
   */
  async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, userId }: ChatbotRequest = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        throw new CustomError('Question is required and must be a non-empty string', 400);
      }

      if (question.length > 1000) {
        throw new CustomError('Question is too long. Maximum 1000 characters allowed.', 400);
      }

      const userIdOrDefault = userId || 'anonymous';
      const answer = await chatbotAgent.processMessage(question.trim(), userIdOrDefault);

      if (!answer) {
        throw new CustomError('Failed to generate response', 500);
      }

      const response: ChatbotResponse = {
        question: question.trim(),
        answer,
        userId: userIdOrDefault,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation history for a user
   */
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId || userId.trim().length === 0) {
        throw new CustomError('User ID is required', 400);
      }

      const history = chatbotAgent.getConversationHistory(userId.trim());

      const response: ConversationHistory = {
        userId: userId.trim(),
        history,
        count: history.length
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const chatbotController = new ChatbotController();
