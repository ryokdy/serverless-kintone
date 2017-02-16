'use strict';

const Kintone = require('kintone');

module.exports.hello = (event, context, callback) => {
  const kintone = new Kintone('test_app');
  const params = {
    app: 6
  };
  kintone.get('/k/v1/records', params).then((res) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        records: res.records
      }),
    };

    callback(null, response);
  });
};
