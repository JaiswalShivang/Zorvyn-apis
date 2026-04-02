import Redis from 'ioredis';
import 'dotenv/config';

const redisUrl = process.env.REDIS_URL;

const redis = new Redis(redisUrl, {
  connectTimeout: 10000,
  maxRetriesPerRequest: 10,
  tls: {
    rejectUnauthorized: false
  }
});

redis.on('error', (err) => {
  console.error('Redis connection issue:', err.message);
});

redis.on('connect', () => {
  console.log('Connected to Upstash Redis!');
});

export default redis;