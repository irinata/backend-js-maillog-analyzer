-- демонстрационный проект - пароль оставлен в открытом виде для простоты настройки
CREATE DATABASE testdb;
CREATE USER test WITH PASSWORD 'test';
GRANT CONNECT ON DATABASE testdb TO test;

\c testdb;

GRANT USAGE, CREATE ON SCHEMA public TO test;

CREATE TABLE message (
  created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  id VARCHAR NOT NULL,
  int_id CHAR(16) NOT NULL,
  CONSTRAINT message_id_pk PRIMARY KEY(id)
);

CREATE TABLE log (
  created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  int_id CHAR(16) NOT NULL,
  str VARCHAR,
  address VARCHAR,
  status VARCHAR NOT NULL,
  flag VARCHAR(2) NOT NULL
);

CREATE INDEX log_created_idx ON log (created);
CREATE INDEX log_flag_idx ON log (flag);
CREATE INDEX log_address_idx ON log (address);
CREATE INDEX message_int_id_idx ON message (int_id);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test;