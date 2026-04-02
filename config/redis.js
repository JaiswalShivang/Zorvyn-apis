import Redis from 'ioredis';
import 'dotenv/config';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

export const connectRedis = async () => {
  try {
    await redis.connect();
    console.log('Redis connected');
  } catch (error) {
    console.warn('Redis connection failed, caching disabled');
  }
};

export default redis;
