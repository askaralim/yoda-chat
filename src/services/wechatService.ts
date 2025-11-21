// WeChat business logic service
// Handles message processing, duplicate detection, caching, and event handling

import { chatbotAgent } from './chatService.js';
import { WeChatMessage } from '../domain/types/wechat.js';
import { redisClient, ensureRedisConnected } from './cacheService.js';
import { logger } from '../utils/logger.js';

export interface WeChatResponse {
  xml: string;
  cached: boolean;
}

export class WeChatService {
  private readonly CACHE_TTL_SECONDS = 3600; // 1 hour

  /**
   * Check if message is a duplicate (WeChat retries if no response within 5 seconds)
   * @param msgId - WeChat message ID
   * @returns Cached response XML if duplicate, null otherwise
   */
  async checkDuplicateMessage(msgId: string | undefined): Promise<string | null> {
    if (!msgId) {
      return null;
    }

    await ensureRedisConnected();
    const cacheKey = `wechat:msg:${msgId}`;
    const cachedResponse = await redisClient.get(cacheKey);

    if (cachedResponse) {
      logger.info('WeChat duplicate message detected', { msgId });
      return cachedResponse;
    }

    return null;
  }

  /**
   * Cache WeChat response by message ID to prevent duplicate processing
   * @param msgId - WeChat message ID
   * @param responseXml - XML response to cache
   */
  async cacheResponse(msgId: string | undefined, responseXml: string): Promise<void> {
    if (!msgId) {
      return;
    }

    await ensureRedisConnected();
    const cacheKey = `wechat:msg:${msgId}`;
    await redisClient.setEx(cacheKey, this.CACHE_TTL_SECONDS, responseXml);
  }

  /**
   * Process a text message and return AI-generated response
   * @param content - Message content
   * @param fromUserName - WeChat user ID
   * @returns AI-generated response text
   */
  async processTextMessage(content: string, fromUserName: string): Promise<string> {
    try {
      const answer = await chatbotAgent.processMessage(content, fromUserName);
      logger.info('WeChat text message processed', {
        fromUser: fromUserName,
        contentPreview: content.slice(0, 80),
      });
      return answer;
    } catch (error) {
      logger.error('Error processing WeChat text message', error);
      throw error;
    }
  }

  /**
   * Handle WeChat event (subscribe, unsubscribe, etc.)
   * @param event - Event type
   * @param eventKey - Optional event key
   * @returns Response message for the event
   */
  handleEvent(event: string | undefined, eventKey: string | undefined): string {
    logger.debug('WeChat event received', { event, eventKey });

    if (event === 'subscribe') {
      return 'hello，欢迎关注「taklip太离谱」！\n如果有想了解的问题，可以直接在输入框发送信息，如果小助手无法回答就会去联系管事儿的。\n\n「taklip太离谱」还有个交流群，用于分享交流，有意加入可以添加微信：asikar\n Cheers!!';
    }

    // Handle other events
    return event || '';
  }

  /**
   * Process incoming WeChat message
   * @param message - Parsed WeChat message
   * @returns Response XML and whether it was cached
   */
  async processMessage(message: WeChatMessage): Promise<WeChatResponse> {
    const { ToUserName, FromUserName, MsgType, Content, MsgId, Event } = message;

    logger.info('WeChat message received', { message });

    // Check for duplicate message
    const cachedResponse = await this.checkDuplicateMessage(MsgId);
    if (cachedResponse) {
      return {
        xml: cachedResponse,
        cached: true,
      };
    }

    let responseContent: string;

    // Process based on message type
    if (MsgType === 'text' && Content) {
      try {
        responseContent = await this.processTextMessage(Content, FromUserName);
      } catch (error) {
        logger.error('Error processing WeChat message', error);
        responseContent = '抱歉，我遇到了一个错误，无法回答你的问题。';
      }
    } else if (MsgType === 'event') {
      responseContent = this.handleEvent(Event, message.EventKey);
    } else {
      responseContent = 'Please send me a text message.';
    }

    // Format XML response
    const responseXml = this.formatTextResponse(ToUserName, FromUserName, responseContent);

    // Cache the response
    await this.cacheResponse(MsgId, responseXml);

    return {
      xml: responseXml,
      cached: false,
    };
  }

  /**
   * Format text response as WeChat XML message
   * @param toUser - Recipient WeChat ID
   * @param fromUser - Sender WeChat ID
   * @param content - Response content
   * @returns Formatted XML string
   */
  formatTextResponse(toUser: string, fromUser: string, content: string): string {
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

export const wechatService = new WeChatService();
