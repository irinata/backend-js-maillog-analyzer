import debugLib from 'debug';
import pool from '../config/database.js';
import logModel from '../models/logModel.js';
import chunk from 'lodash/chunk.js';

const BATCH_SIZE = 100;

const debug = debugLib('app:logService');

async function getRecipientsAndLogsNumbers() {
  debug('Fetching "getRecipientsAndLogsNumbersQuery" database query');
  const rawLogs = await pool.one(logModel.getRecipientsAndLogsNumbersQuery());

  return {
    logsNumber: rawLogs.logs_number,
    recipientsNumber: rawLogs.recs_number,
  };
}

async function getRecipientsAndMessages() {
  const LIMIT = 100;
  debug(`Fetching "getRecipientsAndMessagesQuery(${LIMIT})" database query`);
  const rawLogs = await pool.any(logModel.getRecipientsAndMessagesQuery(LIMIT));

  return {
    limit: rawLogs.length,
    recipients: rawLogs,
  };
}

async function getLogsByAddress(address) {
  if (!address) return;

  const LIMIT = 100;
  debug(`Fetching "getLogsByAddressQuery(${address}, ${LIMIT + 1})" database query`);
  const rawLogs = await pool.any(logModel.getLogsByAddressQuery(address, LIMIT + 1));

  const exceedsLimit = Array.isArray(rawLogs) && rawLogs.length > LIMIT;
  if (exceedsLimit) rawLogs.pop();

  return {
    exceedsLimit,
    limit: LIMIT,
    logs: rawLogs,
  };
}

async function logsDataExist() {
  debug(`Fetching "logsDataExist" database query`);
  return await pool.oneFirst(logModel.logsDataExistQuery());
}

async function insertData(data) {
  debug('Fetching "insertDataQuery" database query');
  const chunks = chunk(data, BATCH_SIZE);

  for (const chunk of chunks) {
    try {
      await pool.query(logModel.insertDataQuery(chunk));
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default {
  getRecipientsAndLogsNumbers,
  getRecipientsAndMessages,
  getLogsByAddress,
  logsDataExist,
  insertData,
};
