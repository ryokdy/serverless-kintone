'use strict';

const kintone = require('kintone');

module.exports.hello = (event, context, callback) => {
  slscrypt.get('test').then((txt) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: txt,
        input: event,
      }),
    };

    callback(null, response);
  });
};
