export interface WeChatMessage {
  ToUserName: string;
  FromUserName: string;
  CreateTime: string;
  MsgType: string;
  Content?: string;
  Event?: string;
  EventKey?: string;
}

export interface WeChatTextResponse {
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Content: string;
}

export interface WeChatQueryParams {
  signature: string;
  timestamp: string;
  nonce: string;
  echostr: string;
}
