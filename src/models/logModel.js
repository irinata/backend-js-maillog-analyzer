import { sql } from 'slonik';
import { prepareInsert } from './baseModel.js';

export function getRecipientsAndLogsNumbersQuery() {
  return sql.unsafe`
    SELECT count(*)::INT as logs_number, count(distinct address)::INT as recs_number
    FROM log
  `;
}

export function getRecipientsAndMessagesQuery(limit = 10) {
  return sql.unsafe`
    SELECT address, count(*)::INT
    FROM log
    GROUP BY address
    ORDER BY count(*) DESC
    LIMIT ${sql.fragment`${limit}`}
  `;
}

export function getLogsByAddressQuery(address, limit = 10) {
  return sql.unsafe`
    SELECT l.created::text as timestamp, l.str as str
    FROM log AS l
    LEFT JOIN message AS m ON l.int_id = m.int_id
    WHERE l.address = ${sql.fragment`${address}`}
    ORDER BY l.created
    LIMIT ${sql.fragment`${limit}`}
  `;
}

export function logsDataExistQuery() {
  return sql.unsafe`
    SELECT EXISTS(SELECT 1 FROM log LIMIT 1)
  `;
}

export function insertDataQuery(data) {
  const tableFields = ['created', 'int_id', 'str', 'address', 'flag', 'status'];
  return prepareInsert('log', tableFields, data);
}

export function getStatsQuery(limit = 10) {
  return sql.unsafe`
    SELECT
      domain,
      delivered::INT,
      failed::INT,
      (delivered + failed)::INT AS total
    FROM (
      SELECT
        SUBSTRING (address FROM '@(.*)$' ) AS domain,
        COUNT(CASE WHEN flag IN ('=>', '->') THEN 1 END) AS delivered,
        COUNT(CASE WHEN flag = '**' THEN 1 END) AS failed
      FROM log
      GROUP BY domain
    ) AS subquery
    ORDER BY total DESC
    LIMIT ${sql.fragment`${limit}`};
  `;
}
