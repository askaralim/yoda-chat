import express from 'express';
import { chatbotController } from '../controllers/chatbotController.js';

export const chatbotRouter = express.Router();

// Test endpoint for chatbot
chatbotRouter.post('/ask', chatbotController.ask.bind(chatbotController));

// Add knowledge documents
chatbotRouter.post('/knowledge/:id', chatbotController.addKnowledge.bind(chatbotController));

// Bulk import knowledge
chatbotRouter.post(
  '/knowledge/bulk',
  chatbotController.bulkImportKnowledge.bind(chatbotController)
);

// Search knowledge
chatbotRouter.get('/knowledge/search', chatbotController.searchKnowledge.bind(chatbotController));

// Update knowledge
chatbotRouter.get('/knowledge/:id', chatbotController.getKnowledge.bind(chatbotController));

// Update knowledge
chatbotRouter.put('/knowledge/:id', chatbotController.updateKnowledge.bind(chatbotController));

// Delete knowledge
chatbotRouter.delete('/knowledge/:id', chatbotController.deleteKnowledge.bind(chatbotController));

// Get conversation history for a user
chatbotRouter.get('/history/:userId', chatbotController.getHistory.bind(chatbotController));
