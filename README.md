# Приложение для агрегации и анализа логов почтового сервера Exim

#### Express + PostgreSQL + Restful API + Docker Compose

### Предварительные требования

- Установленный [Docker](https://docs.docker.com/engine/install/)
- Установленный [Docker Compose](https://docs.docker.com/compose/install/)

### Шаги для запуска

- Клонируйте репозиторий

  ```bash
  git clone https://github.com/irinata/backend-js-maillog-analyzer.git
  cd backend-js-maillog-analyzer
  ```

- Скопируйте шаблон
  ```
  cp env.template .env
  ```
- При необходимости измените пароли в **.env**. По умолчанию используются тестовые значения.

## ⚠️ Важно

Пароль _APP_DB_PASSWORD_ в **.env** должен совпадать с паролем файле в **sql/init.sql**:

```sql
CREATE USER test WITH PASSWORD 'ваш_пароль';
```

- Запустите приложение
  ```bash
  make up         # или docker-compose up
  ```
- После сборки и запуска контейнера приложение будет доступно по адресу _http://localhost:3000_

### После запуска

Приложение создает БД, схему и пустые таблицы для логов. Пример лог-файла **sample-data/maillog-sample.txt**.

### Остановка контейнера

```bash
make down           # или docker-compose down
```

### Полная очистка

Следующая команда остановит и удалит контейнер, образы и данные (volumes), созданные в рамках compose-файла

```bash
make clean          # или docker-compose down -v --rmi all
```
