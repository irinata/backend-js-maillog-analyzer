import debugLib from 'debug';
import { Readable } from 'node:stream';
import readline from 'node:readline';
import parseLogFile from '../services/parserService.js';
import {
  getRecipientsAndLogsNumbers,
  getRecipientsAndMessages,
  insertData as insertLogData,
} from '../services/logService.js';
import { insertData as insertMessageData } from '../services/messageService.js';

const debug = debugLib('app:controller');

function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

export async function index(req, res) {
  debug(`GET ${req.originalUrl}`);
  debug('Awaiting getRecipientsAndLogsNumbers() service');
  debug('Awaiting getRecipientsAndMessages() service');

  const [data1, data2] = await Promise.all([
    getRecipientsAndLogsNumbers(),
    getRecipientsAndMessages(),
  ]);

  const numbers = {
    logsNumber: formatNumber(data1.logsNumber),
    recipientsNumber: formatNumber(data1.recipientsNumber),
  };
  const recipients = {
    limit: data2.limit,
    list: data2.recipients,
  };

  debug('Rendering index page');
  res.render('index', {
    numbers,
    recipients,
    title: 'Логи почтового сервера',
  });
}

export async function uploadLogs(req, res) {
  debug(`File '${req.file.originalname}' uploaded`);
  const buffer = req.file.buffer;
  const stream = Readable.from(buffer);

  const content = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  debug('Parsing data...');
  const parsed = await parseLogFile(content);
  debug('Inserting data into tables...');
  try {
    await insertMessageData(parsed.messages);
    await insertLogData(parsed.logs);

    debug(parsed.messages.length, 'records inserted into table message');
    debug(parsed.logs.length, 'records inserted into table log');
    debug(parsed.messages.length + parsed.logs.length, 'records inserted into database.');
  } catch (error) {
    debug(error);
  }

  res.redirect('/');
}
