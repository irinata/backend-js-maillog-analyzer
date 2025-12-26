import createError from 'http-errors';
import debugLib from 'debug';
import { getLogsByAddress as getLogs, getStats as getDomainStats } from '../services/logService.js';

const debug = debugLib('app:controller');

export async function getLogsByAddress(req, res, next) {
  debug(`GET ${req.originalUrl}`);

  const address = req.params.address;
  if (!address) {
    debug('Email required error');
    return next(createError(400, 'Email required'));
  }

  debug(`Running getLogsByAddress(${address})`);
  const data = await getLogs(address);

  debug('Rendering logs page');
  res.render('logs', {
    logs: data.logs,
    exceedsLimit: data.exceedsLimit,
    limit: data.limit,
    title: `Логи для ${address}`,
  });
}

export async function getStats(req, res) {
  debug(`GET ${req.originalUrl}`);

  const stats = await getDomainStats();
  const totalDelivered = stats.reduce((sum, d) => sum + d.delivered, 0);
  const totalFailed = stats.reduce((sum, d) => sum + d.failed, 0);

  res.render('stats', {
    title: 'Статистика по доменам',
    domains: stats,
    totalDomains: stats.length,
    totalDelivered,
    totalFailed,
  });
}
