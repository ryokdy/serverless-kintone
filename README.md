serverless-kintone

=======

# Description

Serverless plugin to access to kintone.

# Requirements

- [Serverless Framework](https://github.com/serverless/serverless) 1.0 or higher

# Installation

```sh
npm install serverless-kintone --save
```

# Configuration

### serverless.yml

```yaml
provider:
  name: aws
  runtime: nodejs4.3

plugins:
  - serverless-kintone

  custom:
    kintone:
      - name: test_app
        domain: example.cybozu.com
        api_key: ${env:KINTONE_API_KEY}
        basic_user:
        basic_password:
```

### Supported runtimes
- nodejs4.3

# Usage

Code example:  

- Node.js

```js
'use strict';

const Kintone = require('kintone');

module.exports.hello = (event, context, callback) => {
  const kintone = new Kintone('test_app');
  const params = {
    app: 6
  };
  kintone.get(params).then((res) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        records: res.records
      }),
    };

    callback(null, response);
  });
};

```

# Licence

MIT License

# Copyright

Copyright(c) Cybozu, Inc.
