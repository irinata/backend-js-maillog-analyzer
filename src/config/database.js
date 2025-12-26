import { createPool } from 'slonik';
import debugLib from 'debug';
import dotenv from 'dotenv';

dotenv.config();

const debug = debugLib('app:db');

const DELAY = 3000;
const MAX_ATTEMPTS = 5;

const { APP_DB_USER, APP_DB_PASSWORD, APP_DB_HOST, APP_DB_PORT, APP_DB_NAME } = process.env;

const DATABASE_URI = `postgresql://${APP_DB_USER}:${APP_DB_PASSWORD}@${APP_DB_HOST}:${APP_DB_PORT}/${APP_DB_NAME}`;

let pool = null;

let dbStatus = {
  connected: false,
  error: null,
  attempts: 0,
};

async function connectDb(uri) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    dbStatus.attempts = attempt;

    try {
      debug(`Attempt ${attempt}/${MAX_ATTEMPTS} to connect to database...`);
      pool = await createPool(uri);
      dbStatus.connected = true;
      dbStatus.error = null;

      debug('Database connected successfully!');
      return pool;
    } catch (error) {
      debug(`Attempt ${attempt} failed:`, error.message);
      dbStatus.error = error.message;
    }

    if (attempt < MAX_ATTEMPTS) {
      debug(`Waiting ${DELAY}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
  }

  debug('Connection to database failed!');
  return null;
}

connectDb(DATABASE_URI);

export function getPool() {
  if (!pool) {
    throw new Error('Database connection not available');
  }
  return pool;
}

export function getDbStatus() {
  return dbStatus;
}

export function isDbConnected() {
  return dbStatus.connected;
}
