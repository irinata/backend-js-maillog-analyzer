import baseModel from './baseModel.js';

function insertDataQuery(data) {
  const tableFields = ['created', 'id', 'int_id'];
  return baseModel.prepareInsert('message', tableFields, data);
}

export default { insertDataQuery };
