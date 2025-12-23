import createError from 'http-errors';
import debugLib from 'debug';
import Log from '../services/logService.js';

const debug = debugLib('app:controller');

async function getLogsByAddress(req, res, next) {
  debug(`GET ${req.originalUrl}`);

  const address = req.params.address;
  if (!address) {
    debug('Email required error');
    return next(createError(400, 'Email required'));
  }

  debug(`Awaiting getLogsByAddress(${address}) service`);
  const data = await Log.getLogsByAddress(address);

  debug('Rendering logs page');
  res.render('logs', {
    logs: data.logs,
    exceedsLimit: data.exceedsLimit,
    limit: data.limit,
    title: `Логи для ${address}`,
  });
}

export default { getLogsByAddress };
