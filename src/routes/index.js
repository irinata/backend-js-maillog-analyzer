import express from 'express';
import asyncHandler from 'express-async-handler';
import * as indexController from '../controllers/indexController.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

router.get('/', asyncHandler(indexController.index));

router.post('/upload', upload.single('logfile'), asyncHandler(indexController.uploadLogs));

export default router;
