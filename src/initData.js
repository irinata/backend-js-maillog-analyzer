import { open } from 'node:fs/promises';
import path from 'path';
import parseLogFile from './services/parserService.js';
import logService from './services/logService.js';
import messageService from './services/messageService.js';

export default async function initSampleData() {
  try {
    const logsExist = await logService.logsDataExist();
    if (logsExist) {
      console.log('Data already exist, skipping sample load');
      return;
    }

    console.log('Loading sample data...');

    const samplePath = path.join(process.cwd(), 'sample-data', 'maillog.txt');
    const file = await open(samplePath);
    const content = file.readLines();

    const parsed = await parseLogFile(content);
    await messageService.insertData(parsed.messages);
    await logService.insertData(parsed.logs);

    console.log(parsed.messages.length + parsed.logs.length, 'records inserted into database.');
    console.log('Sample data loaded successfully!');
  } catch (error) {
    console.error('Failed to load sample data:', error);
  }
}
