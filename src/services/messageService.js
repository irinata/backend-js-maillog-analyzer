import debugLib from 'debug';
import pool from '../config/database.js';
import messageModel from '../models/messageModel.js';
import chunk from 'lodash/chunk.js';

const BATCH_SIZE = 100;

const debug = debugLib('app:msgService');

async function insertData(data) {
  debug('Fetching "insertDataQuery" database query');
  const chunks = chunk(data, BATCH_SIZE);

  for (const chunk of chunks) {
    try {
      await pool.query(messageModel.insertDataQuery(chunk));
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default { insertData };
