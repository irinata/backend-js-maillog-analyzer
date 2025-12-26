import { sql } from 'slonik';

export function prepareInsert(tableName, tableFields, records) {
  // safe list of filed names
  const safeTableFields = sql.join(
    tableFields.map((field) => sql.identifier([field])),
    sql.fragment`, `,
  );
  // safe values (?, ?, ...)
  const safeValueFields = records.map((rec) => {
    const values = sql.join(
      tableFields.map((field) => rec[field] || 'NEW'),
      sql.fragment`, `,
    );
    return sql.fragment`(${values})`;
  });
  // combine values (?, ?, ...), (?, ?, ...), ...
  const allValues = sql.join(safeValueFields, sql.fragment`, `);

  return sql.unsafe`
    INSERT INTO ${sql.identifier([tableName])} (${safeTableFields})
    VALUES ${allValues}
  `;
}
