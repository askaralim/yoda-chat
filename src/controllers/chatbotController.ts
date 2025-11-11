import { Request, Response, NextFunction } from 'express';
import { chatbotAgent } from '../services/chatService.js';
import { ChatbotRequest, ChatbotResponse, ConversationHistory } from '../types/chatbot.js';
import { CustomError } from '../middleware/errorHandler.js';
import { buildKnowledgeBase, getKnowledgeBase, deleteKnowledgeBase } from '../services/vectorService.js';
import { getAllContents, getContentById } from '../services/dataServices.js';
import { logger } from '../utils/logger.js';

export class ChatbotController {
  /**
   * Add knowledge documents
   */
  async addKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info("Knowledge add requested", { id });
      const content = await getContentById(id as string);
      if (!content) {
        throw new CustomError('Content not found', 404);
      }
      await buildKnowledgeBase([content]);
      logger.info("Knowledge added", { id });
      res.status(200).json({ message: 'Knowledge added successfully' });
    } catch (error) {
      logger.error("Knowledge add failed", error);
      next(error);
    }
  }

  /**
   * Bulk import knowledge
   */
  async bulkImportKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info("Knowledge bulk import requested");
      const contents = await getAllContents();
      await buildKnowledgeBase(contents);
      logger.info("Knowledge bulk import completed", { count: contents.length });
      res.status(200).json({ message: 'Knowledge bulk imported successfully' });
    } catch (error) {
      logger.error("Knowledge bulk import failed", error);
      next(error);
    }
  }

  /**
   * Search knowledge
   */
  async searchKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    // try {
    //   const { q } = req.query;
    //   const results = await searchKnowledgeByKeyword(q as string);
    //   res.status(200).json({ message: 'Knowledge searched successfully', results });
    // } catch (error) {
    //   next(error);
    // }
  }

  async getKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.debug("Knowledge retrieve requested", { id });
      const knowledge = await getKnowledgeBase(id as string);
      res.status(200).json({ message: 'Knowledge retrieved successfully', knowledge });
    } catch (error) {
      logger.error("Knowledge retrieve failed", error);
      next(error);
    }
  }

  /**
   * Update knowledge
   */
  async updateKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info("Knowledge update requested", { id });
      const content = await getContentById(id as string);
      if (!content) {
        throw new CustomError('Content not found', 404);
      }
      await buildKnowledgeBase([content]);
      logger.info("Knowledge updated", { id });
      res.status(200).json({ message: 'Knowledge updated successfully' });
    } catch (error) {
      logger.error("Knowledge update failed", error);
      next(error);
    }
  }

  /**
   * Delete knowledge
   */
  async deleteKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info("Knowledge delete requested", { id });
      await deleteKnowledgeBase(id as string);
      res.status(200).json({ message: 'Knowledge deleted successfully'});
    } catch (error) {
      logger.error("Knowledge delete failed", error);
      next(error);
    }
  }

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
      logger.info("Chat question received", {
        userId: userIdOrDefault,
        length: question.length,
        preview: question.slice(0, 80),
      });
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
      logger.info("Chat response delivered", {
        userId: userIdOrDefault,
        answerPreview: answer.slice(0, 80),
      });
    } catch (error) {
      logger.error("Chat ask handler failed", error);
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

      const history = await chatbotAgent.getConversationHistory(userId.trim());

      const response: ConversationHistory = {
        userId: userId.trim(),
        history,
        count: history.length
      };

      res.status(200).json(response);
      logger.debug("Chat history returned", { userId: userId.trim(), count: history.length });
    } catch (error) {
      logger.error("Chat history handler failed", error);
      next(error);
    }
  }
}

export const chatbotController = new ChatbotController();
