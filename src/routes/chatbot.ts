import express from 'express';
import { chatbotController } from '../controllers/chatbotController.js';

export const chatbotRouter = express.Router();

// Test endpoint for chatbot
chatbotRouter.post('/ask', chatbotController.ask);

// Get conversation history for a user
chatbotRouter.get('/history/:userId', chatbotController.getHistory);
