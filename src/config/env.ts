import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mysql: {
    host: process.env.MYSQL_HOST!,
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL!,
  },
  gpt: {
    model: process.env.GPT_MODEL!,
    maxTokens: process.env.GPT_MAX_TOKENS!,
    temperature: process.env.GPT_TEMPERATURE!,
  },
  wechat: {
    appid: process.env.WECHAT_APPID!,
    appsecret: process.env.WECHAT_APPSECRET!,
    token: process.env.WECHAT_TOKEN!,
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY!,
  },
};
