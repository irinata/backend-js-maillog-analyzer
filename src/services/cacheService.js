import { getRedisClient, isRedisConnected } from '../config/redis.js';
import debugLib from 'debug';

const debug = debugLib('app:cache');

const DEFAULT_TTL = 300; // 5 min
const CACHE_PREFIX = 'mail-logs:';

export async function get(key) {
  if (!isRedisConnected()) {
    debug('Redis not available, skipping cache read');
    return null;
  }

  try {
    const redis = getRedisClient();
    const fullKey = CACHE_PREFIX + key;
    const data = await redis.get(fullKey);

    if (data) {
      debug(`Cache HIT: ${key}`);
      return JSON.parse(data);
    }

    debug(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    debug(`Cache read error for ${key}:`, error.message);
    return null;
  }
}

export async function set(key, value, ttl = DEFAULT_TTL) {
  if (!isRedisConnected()) {
    debug('Redis not available, skipping cache write');
    return false;
  }

  try {
    const redis = getRedisClient();
    const fullKey = CACHE_PREFIX + key;
    await redis.setEx(fullKey, ttl, JSON.stringify(value));
    debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    debug(`Cache write error for ${key}:`, error.message);
    return false;
  }
}

export async function flush() {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const redis = getRedisClient();
    const keys = await redis.keys(CACHE_PREFIX + '*');

    if (keys.length > 0) {
      await redis.del(keys);
      debug(`Cache FLUSH: ${keys.length} keys deleted`);
    }

    return true;
  } catch (error) {
    debug('Cache flush error:', error.message);
    return false;
  }
}
