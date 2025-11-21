import crypto from 'crypto';
import { parseString } from 'xml2js';
import { Request, Response } from 'express';
import { WeChatMessage, WeChatQueryParams } from '../domain/types/wechat.js';
import { logger } from '../utils/logger.js';
import { wechatService } from '../services/wechatService.js';

export class WeChatController {
  /**
   * Verify WeChat server (required for WeChat public account setup)
   * WeChat will send a GET request with signature, timestamp, nonce, and echostr
   */
  verify(req: Request, res: Response): void {
    const { signature, timestamp, nonce, echostr } = req.query as unknown as WeChatQueryParams;
    const token = process.env.WECHAT_TOKEN;

    if (!token) {
      res.status(500).send('WeChat token not configured');
      return;
    }

    // Sort the parameters
    const tmpArr = [token, timestamp, nonce].sort();
    const tmpStr = tmpArr.join('');

    // Create SHA1 hash
    const hash = crypto.createHash('sha1');
    hash.update(tmpStr);
    const sha1Str = hash.digest('hex');

    // Verify signature
    if (sha1Str === signature) {
      res.send(echostr);
    } else {
      res.status(403).send('Invalid signature');
    }
  }

  /**
   * Handle incoming WeChat messages
   */
  handleMessage(req: Request, res: Response): void {
    try {
      // req.body is now a string (XML) thanks to express.text middleware
      const xmlData = req.body as string;

      if (!xmlData || typeof xmlData !== 'string') {
        res.status(400).send('Invalid XML data');
        return;
      }

      // Parse XML to JSON - using arrow function to preserve 'this' context
      parseString(
        xmlData,
        { explicitArray: false },
        (err: Error | null, result: { xml?: WeChatMessage }) => {
          if (err) {
            logger.error('WeChat XML parsing error', err);
            res.status(400).send('Invalid XML format');
            return;
          }

          if (!result?.xml) {
            logger.error('WeChat XML parsing error: missing xml property');
            res.status(400).send('Invalid XML format');
            return;
          }

          // Use IIFE to handle async operations inside the callback
          void (async () => {
            const message = result.xml as WeChatMessage;

            // Echo the message back to WeChat server immediately (required by WeChat)
            res.writeHead(200, { 'Content-Type': 'application/xml' });

            try {
              // Process message through service (handles duplicate detection, processing, caching)
              const response = await wechatService.processMessage(message);
              res.end(response.xml);
            } catch (error) {
              logger.error('Error processing WeChat message', error);
              // Send error response
              const errorMsg = '抱歉，我遇到了一个错误，无法回答你的问题。';
              const errorXml = wechatService.formatTextResponse(
                message.ToUserName,
                message.FromUserName,
                errorMsg
              );
              // Cache error response to prevent retry processing
              await wechatService.cacheResponse(message.MsgId, errorXml);
              res.end(errorXml);
            }
          })();
        }
      );
    } catch (error) {
      logger.error('Error handling WeChat message', error);
      res.status(500).send('Internal server error');
    }
  }
}

export const wechatController = new WeChatController();
