import { createClient } from 'redis';
import debugLib from 'debug';

const debug = debugLib('app:redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}/0`;

let redisClient = null;
let isConnected = false;

async function connectRedis() {
  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            debug('Too many Redis reconnection attempts, giving up');
            return new Error('Redis reconnection failed');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => {
      debug('Redis Client Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      debug('Redis connected');
      isConnected = true;
    });

    redisClient.on('disconnect', () => {
      debug('Redis disconnected');
      isConnected = false;
    });

    await redisClient.connect();
    await redisClient.ping();
    debug('Redis ping successful');

    return redisClient;
  } catch (error) {
    debug('Redis connection failed:', error.message);
    isConnected = false;
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
}

export function isRedisConnected() {
  return isConnected && redisClient?.isOpen;
}

connectRedis();

export default { getRedisClient, isRedisConnected };
