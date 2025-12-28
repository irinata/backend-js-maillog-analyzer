import { open } from 'node:fs/promises';
import path from 'path';
import parseLogFile from './services/parserService.js';
import { logsDataExist, insertData as insertLogData } from './services/logService.js';
import { insertData as insertMessageData } from './services/messageService.js';

export default async function initSampleData() {
  try {
    const logsExist = await logsDataExist();
    if (logsExist) {
      console.log('Data already exist, skipping sample load');
      return;
    }

    const samplePath = path.join(process.cwd(), 'sample-data', 'maillog-sample.txt');
    const file = await open(samplePath);
    const content = file.readLines();

    const parsed = await parseLogFile(content);
    await insertMessageData(parsed.messages);
    await insertLogData(parsed.logs);

    console.log(parsed.messages.length + parsed.logs.length, 'records inserted into database.');
    console.log('Sample data loaded successfully!');
  } catch (error) {
    console.error('Failed to load sample data:', error);
  }
}
