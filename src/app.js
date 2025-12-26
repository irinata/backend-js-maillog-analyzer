import express from 'express';
import createError from 'http-errors';
import path from 'path';
import { getDbStatus, isDbConnected } from './config/database.js';
import indexRouter from './routes/index.js';
import logRouter from './routes/logs.js';
import initSampleData from './initData.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.set('views', path.join(process.cwd(), 'src', 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

app.use((req, res, next) => {
  if (!isDbConnected()) {
    const status = getDbStatus();
    return res.render('db-error', {
      status,
      title: 'Ошибка подключения к БД',
    });
  }
  next();
});

app.use('/', indexRouter);
app.use('/logs', logRouter);

app.use((req, res, next) => {
  if (req.path === '/.well-known/appspecific/com.chrome.devtools.json') {
    return res.status(404).send();
  }
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode);

  res.locals.error =
    req.app.get('env') === 'development'
      ? err
      : {
          message: 'Something went wrong!',
        };

  res.locals.error.status = statusCode;
  res.render('error');
});

if (process.env.AUTO_LOAD_SAMPLE === 'true') {
  console.log(`AUTO_LOAD_SAMPLE true`);
  await initSampleData();
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
