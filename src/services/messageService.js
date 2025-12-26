import debugLib from 'debug';
import { getPool } from '../config/database.js';
import { insertDataQuery } from '../models/messageModel.js';
import chunk from 'lodash/chunk.js';

const BATCH_SIZE = 100;

const debug = debugLib('app:msgService');

export async function insertData(data) {
  debug('Fetching "insertDataQuery" database query');
  const pool = getPool();
  const chunks = chunk(data, BATCH_SIZE);

  for (const chunk of chunks) {
    try {
      await pool.query(insertDataQuery(chunk));
    } catch (error) {
      throw new Error(error);
    }
  }
}
