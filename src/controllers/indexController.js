import debugLib from 'debug';
import { Readable } from 'node:stream';
import readline from 'node:readline';
import parseLogFile from '../services/parserService.js';
import Log from '../services/logService.js';
import Msg from '../services/messageService.js';

const debug = debugLib('app:controller');

function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

async function index(req, res) {
  debug(`GET ${req.originalUrl}`);
  debug('Awaiting getRecipientsAndLogsNumbers() service');
  debug('Awaiting getRecipientsAndMessages() service');

  const [data1, data2] = await Promise.all([
    Log.getRecipientsAndLogsNumbers(),
    Log.getRecipientsAndMessages(),
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

async function uploadLogs(req, res) {
  debug(`File '${req.file.originalname}' uploaded`);
  const buffer = req.file.buffer; // uploaded data
  const stream = Readable.from(buffer); // create stream from buffer

  const content = readline.createInterface({
    input: stream,
    crlfDelay: Infinity, // корректно обрабатывает и \n, и \r\n
  });

  debug('Parsing data...');
  const parsed = await parseLogFile(content);
  debug('Inserting data into tables...');
  try {
    await Msg.insertData(parsed.messages);
    await Log.insertData(parsed.logs);
  } catch (error) {
    debug(error);
  }

  debug(parsed.messages.length, 'records inserted into table message');
  debug(parsed.logs.length, 'records inserted into table log');
  debug(parsed.messages.length + parsed.logs.length, 'records inserted into database.');

  res.redirect('/');
}

export default { index, uploadLogs };
