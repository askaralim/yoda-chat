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
  redis: {
    host: process.env.REDIS_HOST!,
    port: process.env.REDIS_PORT!,
    password: process.env.REDIS_PASSWORD!,
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
  vector: {
    chunkSize: process.env.VECTOR_CHUNK_SIZE!,
    topK: process.env.VECTOR_TOP_K || '3',
    minScore: process.env.VECTOR_MIN_SCORE || '0.75',
  },
  embedding: {
    model: process.env.EMBEDDING_MODEL!,
    dimensions: process.env.EMBEDDING_DIMENSIONS!,
    batchSize: process.env.EMBEDDING_BATCH_SIZE!,
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY || '',
  },
  wechat: {
    appid: process.env.WECHAT_APPID!,
    appsecret: process.env.WECHAT_APPSECRET!,
    token: process.env.WECHAT_TOKEN!,
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY!,
  },
  qdrant: {
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
  },
  features: {
    bootstrapOnStart: process.env.RAG_BOOTSTRAP === 'true',
  },
};
