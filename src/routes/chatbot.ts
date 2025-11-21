import express, { NextFunction, Request, Response } from 'express';
import { chatbotController } from '../controllers/chatbotController.js';

export const chatbotRouter = express.Router();

// Test endpoint for chatbot
chatbotRouter.post('/ask', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.ask(req, res, next);
});

// Add knowledge documents
chatbotRouter.post('/knowledge/:id', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.addKnowledge(req, res, next);
});

// Bulk import knowledge
chatbotRouter.post('/knowledge/bulk', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.bulkImportKnowledge(req, res, next);
});

// Search knowledge
chatbotRouter.get('/knowledge/search', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.searchKnowledge(req, res, next);
});

// Update knowledge
chatbotRouter.get('/knowledge/:id', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.getKnowledge(req, res, next);
});

// Update knowledge
chatbotRouter.put('/knowledge/:id', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.updateKnowledge(req, res, next);
});

// Delete knowledge
chatbotRouter.delete('/knowledge/:id', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.deleteKnowledge(req, res, next);
});

// Get conversation history for a user
chatbotRouter.get('/history/:userId', (req: Request, res: Response, next: NextFunction) => {
  void chatbotController.getHistory(req, res, next);
});
