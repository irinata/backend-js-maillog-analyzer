import debugLib from 'debug';
import { getPool } from '../config/database.js';
import * as logModel from '../models/logModel.js';
import * as cacheService from './cacheService.js';
import chunk from 'lodash/chunk.js';

const BATCH_SIZE = 100;
const CACHE_TTL = 300; // 5 min

const debug = debugLib('app:logService');

export async function getRecipientsAndLogsNumbers() {
  const cacheKey = `recipients:logs:numbers`;
  debug(`Getting data from cache by key ${cacheKey}`);

  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  debug('Fetching "getRecipientsAndLogsNumbersQuery" database query');
  const pool = getPool();
  const result = await pool.one(logModel.getRecipientsAndLogsNumbersQuery());

  const data = {
    logsNumber: result.logs_number,
    recipientsNumber: result.recs_number,
  };

  await cacheService.set(cacheKey, data, CACHE_TTL);

  return data;
}

export async function getRecipientsAndMessages() {
  const cacheKey = `recipients:messages`;
  debug(`Getting data from cache by key ${cacheKey}`);

  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const LIMIT = 100;
  debug(`Fetching "getRecipientsAndMessagesQuery(${LIMIT})" database query`);
  const pool = getPool();
  const result = await pool.any(logModel.getRecipientsAndMessagesQuery(LIMIT));

  const data = {
    limit: result.length,
    recipients: result,
  };

  await cacheService.set(cacheKey, data, CACHE_TTL);

  return data;
}

export async function getLogsByAddress(address) {
  if (!address) return;

  const cacheKey = `logs:by:${address}`;
  debug(`Getting data from cache by key ${cacheKey}`);

  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const LIMIT = 100;
  debug(`Fetching "getLogsByAddressQuery(${address}, ${LIMIT + 1})" database query`);
  const pool = getPool();
  const result = await pool.any(logModel.getLogsByAddressQuery(address, LIMIT + 1));

  const exceedsLimit = Array.isArray(result) && result.length > LIMIT;
  if (exceedsLimit) result.pop();

  const data = {
    exceedsLimit,
    limit: LIMIT,
    logs: result,
  };

  await cacheService.set(cacheKey, data, CACHE_TTL);

  return data;
}

export async function logsDataExist() {
  const pool = getPool();
  debug(`Fetching "logsDataExist" database query`);
  return await pool.oneFirst(logModel.logsDataExistQuery());
}

export async function insertData(data) {
  debug('Fetching "insertDataQuery" database query');
  const pool = getPool();
  const chunks = chunk(data, BATCH_SIZE);

  for (const chunk of chunks) {
    try {
      await pool.query(logModel.insertDataQuery(chunk));
    } catch (error) {
      throw new Error(error);
    }
  }
}

export async function getStats() {
  const cacheKey = `logs:stat`;
  debug(`Getting data from cache by key ${cacheKey}`);

  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  debug('Fetching "getStatsQuery" database query');
  const pool = getPool();
  const LIMIT = 50;
  const data = await pool.any(logModel.getStatsQuery(LIMIT));

  await cacheService.set(cacheKey, data, CACHE_TTL);

  return data;
}
