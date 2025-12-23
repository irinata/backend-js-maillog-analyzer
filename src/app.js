import express from 'express';
import createError from 'http-errors';
import path from 'path';
import indexRouter from './routes/index.js';
import logRouter from './routes/logs.js';
import initSampleData from './initData.js';

const PORT = 3000;

const app = express();

// настройка движка представлений Pug
app.set('views', path.join(process.cwd(), 'src', 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

app.use('/', indexRouter);
app.use('/logs', logRouter);

app.use(function (req, res, next) {
  if (req.path === '/.well-known/appspecific/com.chrome.devtools.json') {
    return res.status(404).send();
  }
  console.log('404 for: ', req.path);
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
