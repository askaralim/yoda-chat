import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { wechatRouter } from './routes/wechat.js';
import { chatbotRouter } from './routes/chatbot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for WeChat (raw XML text)
app.use('/wechat', express.text({ type: 'application/xml', limit: '1mb' }));

// Middleware for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/wechat', wechatRouter);
app.use('/chatbot', chatbotRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Yoda Chat API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Yoda Chat server is running on port ${PORT}`);
  console.log(`📡 WeChat endpoint: http://localhost:${PORT}/wechat`);
});
