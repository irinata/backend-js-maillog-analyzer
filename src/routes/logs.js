import express from 'express';
import createError from 'http-errors';
import asyncHandler from 'express-async-handler';
import debugLib from 'debug';
import * as logController from '../controllers/logController.js';

const debug = debugLib('app:route');
const router = express.Router();

router.get('/', (req, res, next) => {
  debug(`GET ${req.originalUrl}`);

  let address = req.query.address;
  if (typeof address !== 'string' || !address.trim()) {
    debug('Email required error');
    return next(createError(400, 'Email required'));
  }

  debug(`Redirecting to /logs/${address}`);
  res.redirect(`/logs/${encodeURIComponent(address)}`);
});

router.get('/stats', asyncHandler(logController.getStats));

router.get('/:address', asyncHandler(logController.getLogsByAddress));

export default router;
