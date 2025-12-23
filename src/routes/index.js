import express from 'express';
import asyncHandler from 'express-async-handler';
import indexController from '../controllers/indexController.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB макс
});

// ALTER TABLE message ALTER COLUMN status TYPE VARCHAR;
//   const MESSAGE_STATUS = {
//   NEW: 'new',           // новое (по умолчанию)
//   REVIEWED: 'reviewed', // проверено
//   SPAM: 'spam',         // спам
//   ARCHIVED: 'archived'  // архивировано
// });

// home page
router.get('/', asyncHandler(indexController.index));

router.post('/upload', upload.single('logfile'), asyncHandler(indexController.uploadLogs));

export default router;
