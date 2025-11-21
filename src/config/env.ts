import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // MySQL
  MYSQL_HOST: z.string().min(1, 'MySQL host is required'),
  MYSQL_USER: z.string().min(1, 'MySQL user is required'),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string().min(1, 'MySQL database is required'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // OpenAI/API2D
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_BASE_URL: z.string().url().default('https://openai.api2d.net'),

  // GPT
  GPT_MODEL: z.string().default('gpt-3.5-turbo'),
  GPT_MAX_TOKENS: z.coerce.number().int().positive().default(1000),
  GPT_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),

  // Embeddings
  EMBEDDING_MODEL: z.string().min(1, 'Embedding model is required'),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536),
  EMBEDDING_BATCH_SIZE: z.coerce.number().int().positive().default(100),

  // Vector Database
  VECTOR_CHUNK_SIZE: z.coerce.number().int().positive().default(500),
  VECTOR_TOP_K: z.coerce.number().int().positive().default(3),
  VECTOR_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.75),

  // Qdrant
  QDRANT_URL: z.string().url().min(1, 'Qdrant URL is required'),
  QDRANT_API_KEY: z.string().optional(),

  // Admin
  ADMIN_API_KEY: z.string().default(''),

  // WeChat (optional - only required if using WeChat)
  WECHAT_APPID: z.string().optional(),
  WECHAT_APPSECRET: z.string().optional(),
  WECHAT_TOKEN: z.string().optional(),
  WECHAT_ENCODING_AES_KEY: z.string().optional(),

  // Features
  RAG_BOOTSTRAP: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // Conversation
  CONVERSATION_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  MAX_HISTORY_CONTEXT: z.coerce.number().int().positive().default(10),
  MAX_HISTORY_STORED: z.coerce.number().int().positive().default(50),
  CONFIDENCE_THRESHOLDS_LOW: z.coerce.number().min(0).max(1).default(0.3),
  CONFIDENCE_THRESHOLDS_MEDIUM: z.coerce.number().min(0).max(1).default(0.7),
  CONFIDENCE_THRESHOLDS_HIGH: z.coerce.number().min(0).max(1).default(0.9),
});

// Validate and parse environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  logger.error('❌ Invalid environment variables:', {
    errors: parseResult.error.format(),
  });
  console.error('\n❌ Environment variable validation failed:');
  parseResult.error.issues.forEach((err: z.ZodIssue) => {
    const path = err.path.join('.');
    console.error(`  - ${path}: ${err.message}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.\n');
  process.exit(1);
}

const env = parseResult.data;

// Export typed config object (maintains same structure as before)
export const config = {
  port: env.PORT,
  mysql: {
    host: env.MYSQL_HOST,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT.toString(),
    password: env.REDIS_PASSWORD || '',
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
  },
  gpt: {
    model: env.GPT_MODEL,
    maxTokens: env.GPT_MAX_TOKENS.toString(),
    temperature: env.GPT_TEMPERATURE.toString(),
  },
  vector: {
    chunkSize: env.VECTOR_CHUNK_SIZE.toString(),
    topK: env.VECTOR_TOP_K.toString(),
    minScore: env.VECTOR_MIN_SCORE.toString(),
  },
  embedding: {
    model: env.EMBEDDING_MODEL,
    dimensions: env.EMBEDDING_DIMENSIONS.toString(),
    batchSize: env.EMBEDDING_BATCH_SIZE.toString(),
  },
  admin: {
    apiKey: env.ADMIN_API_KEY,
  },
  wechat: {
    appid: env.WECHAT_APPID || '',
    appsecret: env.WECHAT_APPSECRET || '',
    token: env.WECHAT_TOKEN || '',
    encodingAESKey: env.WECHAT_ENCODING_AES_KEY || '',
  },
  qdrant: {
    url: env.QDRANT_URL,
    apiKey: env.QDRANT_API_KEY || '',
  },
  features: {
    bootstrapOnStart: env.RAG_BOOTSTRAP,
  },
  conversation: {
    conversationTtlSeconds: env.CONVERSATION_TTL_SECONDS.toString(),
    maxHistoryContext: env.MAX_HISTORY_CONTEXT.toString(),
    maxHistoryStored: env.MAX_HISTORY_STORED.toString(),
    confidenceThresholds: {
      LOW: env.CONFIDENCE_THRESHOLDS_LOW.toString(),
      MEDIUM: env.CONFIDENCE_THRESHOLDS_MEDIUM.toString(),
      HIGH: env.CONFIDENCE_THRESHOLDS_HIGH.toString(),
    },
  },
} as const;

logger.info('✅ Configuration loaded and validated', {
  env: env.NODE_ENV,
  mysqlHost: config.mysql.host,
  redisHost: config.redis.host,
  redisPort: config.redis.port,
  qdrantUrl: config.qdrant.url,
  bootstrapOnStart: config.features.bootstrapOnStart,
});
