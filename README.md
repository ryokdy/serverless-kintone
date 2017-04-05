# serverless-kintone

=======

# Description

Serverless plugin for integration with kintone.

# Requirements

- [Serverless Framework](https://github.com/serverless/serverless) 1.0 or higher

# Installation

```sh
$ npm install https://github.com/ryokdy/serverless-kintone --save
```
Sorry, This library is not published to npm registry yet. That will be soon.

# Configuration

## Encrypt your api token or password by using KMS

We strongly recommend to encrypt your api token and password to store them. The feature will be available when "encrypted" flag is "true" in serverless.yml.

### 1. Create key on KMS

You have to create the KMS key beforehand. See AWS document for details.

http://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html

### 2. Create and attach IAM policy to your serverless service role  
Policy example:  

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt"
            ],
            "Resource": [
                "arn:aws:kms:us-east-1:<your-account-number>:key/<your-key-id>"
            ]
        }
    ]
}
```

### 3. Encrypt and save the secret to your serverless.yml.
Command example:  

```sh
$ aws kms encrypt --key-id alias/my-kms-key --region us-east-1 --plaintext YOUR_TOKEN
```

## serverless.yml

```yaml
provider:
  name: aws
  runtime: nodejs4.3

plugins:
  - serverless-kintone

custom:
  kintone:
    - name: app1
      domain: example.kintone.com
      api_token: <ENCRYPTED_API_TOKEN>
      encrypted: true
    - name: app2
      domain: example.kintone.com
      user: user1
      password: <ENCRYPTED_PASSWORD>
      basic_user: kintone_user
      basic_password: <ENCRYPTED_BASIC_PASSWORD>
      encrypted: true
```

## Supported runtimes
- nodejs4.3

# Usage

get, post, put, delete, upload and download methods are available.

Code example:  

- Node.js

```js
'use strict';

const Kintone = require('kintone');
const app = new Kintone('app1');

module.exports.hello = (event, context, callback) => {
  const params = {
    app: 6
  };
  app.get('/k/v1/records', params).then((res) => {
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

## Download files

```js
const app = new Kintone('app1');

const params = {
  app: 6,
  id: 1,
}
app.get('/k/v1/record', params).then((res) => {
  const file = res.record.file.value[0];
  app.download(file.fileKey, `/tmp/${file.name}`).then((path) => {
    console.log(path);
  });
});
```

## Upload files

```js
const app = new Kintone('app1');

app.upload('/tmp/image.png').then((res) => {
  const params = {
    app: 6,
    id: 1,
    record: {
      file: {value: [{fileKey:res.fileKey}]}
    }
  }
  app.put('/k/v1/record', params).then((res) => {
    console.log(res.revision);
  });
});
```

# Licence

MIT License

# Copyright

Copyright(c) Cybozu, Inc.
