import { createPool } from 'slonik';
import debugLib from 'debug';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.app' });

const debug = debugLib('app:db');

const {
  APP_DB_USER,
  APP_DB_PASSWORD,
  APP_DB_HOST = 'localhost',
  APP_DB_PORT,
  APP_DB_NAME,
} = process.env;

const DATABASE_URI = `postgresql://${APP_DB_USER}:${APP_DB_PASSWORD}@${APP_DB_HOST}:${APP_DB_PORT}/${APP_DB_NAME}`;
debug('Connecting to database...');
const pool = await createPool(DATABASE_URI);

export default pool;
