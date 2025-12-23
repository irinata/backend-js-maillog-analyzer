import { sql } from 'slonik';
import baseModel from './baseModel.js';

function getRecipientsAndLogsNumbersQuery() {
  return sql.unsafe`
    SELECT count(*)::INT as logs_number, count(distinct address)::INT as recs_number
    FROM log
  `;
}

function getRecipientsAndMessagesQuery(limit = 10) {
  return sql.unsafe`
    SELECT address, count(*)
    FROM log
    GROUP BY address
    ORDER BY count(*) DESC
    LIMIT ${sql.fragment`${limit}`}
  `;
}

function getLogsByAddressQuery(address, limit = 10) {
  return sql.unsafe`
    SELECT l.created::text as timestamp, l.str as str
    FROM log AS l
    LEFT JOIN message AS m ON l.int_id = m.int_id
    WHERE l.address = ${sql.fragment`${address}`}
    ORDER BY l.created
    LIMIT ${sql.fragment`${limit}`}
  `;
}

function logsDataExistQuery() {
  return sql.unsafe`
    SELECT EXISTS(SELECT 1 FROM log LIMIT 1)
  `;
}

function insertDataQuery(data) {
  const tableFields = ['created', 'int_id', 'str', 'address', 'flag', 'status'];
  return baseModel.prepareInsert('log', tableFields, data);
}

export default {
  getRecipientsAndLogsNumbersQuery,
  getRecipientsAndMessagesQuery,
  getLogsByAddressQuery,
  logsDataExistQuery,
  insertDataQuery,
};
