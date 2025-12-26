import debugLib from 'debug';
import { getPool } from '../config/database.js';
import * as logModel from '../models/logModel.js';
import chunk from 'lodash/chunk.js';

const BATCH_SIZE = 100;

const debug = debugLib('app:logService');

export async function getRecipientsAndLogsNumbers() {
  debug('Fetching "getRecipientsAndLogsNumbersQuery" database query');
  const pool = getPool();
  const result = await pool.one(logModel.getRecipientsAndLogsNumbersQuery());

  return {
    logsNumber: result.logs_number,
    recipientsNumber: result.recs_number,
  };
}

export async function getRecipientsAndMessages() {
  const LIMIT = 100;
  const pool = getPool();
  debug(`Fetching "getRecipientsAndMessagesQuery(${LIMIT})" database query`);
  const result = await pool.any(logModel.getRecipientsAndMessagesQuery(LIMIT));

  return {
    limit: result.length,
    recipients: result,
  };
}

export async function getLogsByAddress(address) {
  if (!address) return;

  const LIMIT = 100;
  const pool = getPool();
  debug(`Fetching "getLogsByAddressQuery(${address}, ${LIMIT + 1})" database query`);
  const result = await pool.any(logModel.getLogsByAddressQuery(address, LIMIT + 1));

  const exceedsLimit = Array.isArray(result) && result.length > LIMIT;
  if (exceedsLimit) result.pop();

  return {
    exceedsLimit,
    limit: LIMIT,
    logs: result,
  };
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
  debug('Fetching "getStatsQuery" database query');
  const pool = getPool();
  const LIMIT = 50;
  return await pool.any(logModel.getStatsQuery(LIMIT));
}
