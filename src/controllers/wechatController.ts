import crypto from 'crypto';
import { parseString } from 'xml2js';
import { Request, Response } from 'express';
import { chatbotAgent } from '../services/chatService.js';
import { WeChatMessage, WeChatQueryParams } from '../types/wechat.js';

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
  async handleMessage(req: Request, res: Response): Promise<void> {
    try {
      // req.body is now a string (XML) thanks to express.text middleware
      const xmlData = req.body as string;

      if (!xmlData || typeof xmlData !== 'string') {
        res.status(400).send('Invalid XML data');
        return;
      }

      // Parse XML to JSON - using arrow function to preserve 'this' context
      parseString(xmlData, { explicitArray: false }, async (err: any, result: any) => {
        if (err) {
          console.error('XML parsing error:', err);
          res.status(400).send('Invalid XML format');
          return;
        }

        const message = result.xml as WeChatMessage;
        const { 
          ToUserName, FromUserName, MsgType, Content
          // , CreateTime, MsgId, MsgDataId, Idx 
        } = message;

        // Echo the message back to WeChat server immediately (required by WeChat)
        res.writeHead(200, { 'Content-Type': 'application/xml' });

        // Only process text messages
        if (MsgType === 'text' && Content) {
          try {
            // Get AI response from chatbot agent
            const answer = await chatbotAgent.processMessage(Content, FromUserName);

            // Format XML response
            const responseXml = WeChatController.formatTextResponse(
              ToUserName,
              FromUserName,
              answer
            );

            res.end(responseXml);
          } catch (error) {
            console.error('Error processing message:', error);
            const errorMsg = '抱歉，我遇到了一个错误，无法回答你的问题。';
            const responseXml = WeChatController.formatTextResponse(
              ToUserName,
              FromUserName,
              errorMsg
            );
            res.end(responseXml);
          }
        } else if (MsgType === 'event') {
          // Handle events
          const event = message.Event;
          const eventKey = message.EventKey;
          if (event === 'subscribe') {
            // Handle subscribe event
            const responseXml = WeChatController.formatTextResponse(
              ToUserName,
              FromUserName,
              'hello，欢迎关注「taklip太离谱」！\n如果有想了解的问题，可以直接在输入框发送信息，如果小助手无法回答就会去联系管事儿的。\n\n「taklip太离谱」还有个交流群，用于分享交流，有意加入可以添加微信：asikar\n Cheers!!'
            );
            res.end(responseXml);
          }
          const responseXml = WeChatController.formatTextResponse(
            ToUserName,
            FromUserName,
            event || ''
          );
          res.end(responseXml);
        } else {
          // Handle non-text messages or events
          const defaultMsg = 'Please send me a text message.';
          const responseXml = WeChatController.formatTextResponse(
            ToUserName,
            FromUserName,
            defaultMsg
          );
          res.end(responseXml);
        }
      });
    } catch (error) {
      console.error('Error handling WeChat message:', error);
      res.status(500).send('Internal server error');
    }
  }

  /**
   * Format text response as WeChat XML message
   */
  static formatTextResponse(toUser: string, fromUser: string, content: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `<xml>
      <ToUserName><![CDATA[${fromUser}]]></ToUserName>
      <FromUserName><![CDATA[${toUser}]]></FromUserName>
      <CreateTime>${timestamp}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[${content}]]></Content>
    </xml>`;
  }
}

export const wechatController = new WeChatController();
