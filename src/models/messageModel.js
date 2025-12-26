import { prepareInsert } from './baseModel.js';

export function insertDataQuery(data) {
  const tableFields = ['created', 'id', 'int_id'];
  return prepareInsert('message', tableFields, data);
}
