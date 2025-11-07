// redis service
import { createClient } from 'redis';
import { config } from '../config/env.js';

export const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: config.redis.password,
});

let connectingPromise: Promise<void> | null = null;

export async function ensureRedisConnected(): Promise<void> {
  if (redisClient.isOpen) {
    return;
  }

  if (!connectingPromise) {
    connectingPromise = (async () => {
      try {
        await redisClient.connect();
      } finally {
        connectingPromise = null;
      }
    })();
  }

  await connectingPromise;
}