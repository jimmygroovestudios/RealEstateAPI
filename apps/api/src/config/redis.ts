import { createClient } from 'redis';
import logger from '../utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;
let isRedisConnected = false;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', () => {
      // Silently handle errors after initial connection attempt
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch {
    logger.warn('Redis not available - running without cache');
    redisClient = null;
    isRedisConnected = false;
  }
};

export const getRedisClient = () => redisClient;
export const isRedisAvailable = () => isRedisConnected;

export default { connectRedis, getRedisClient, isRedisAvailable };
