import express from 'express';
import { wechatController } from '../controllers/wechatController.js';

export const wechatRouter = express.Router();

// WeChat verification endpoint (GET request for initial setup)
wechatRouter.get('/', wechatController.verify.bind(wechatController));

// WeChat message handler (POST request for incoming messages)
wechatRouter.post('/', wechatController.handleMessage.bind(wechatController));
