'use strict';

const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const AWS = require('aws-sdk')

module.exports = class Kintone {
  constructor(opts) {
    if (typeof opts === 'string') {
      opts = this.getConfig(opts);
    }
    opts = opts || {};

    if (!opts.domain) {
      throw new TypeError('Domain parameter is not specified.');
    }

    this.domain = opts.domain;
    if (!this.domain.match('\\.')) {
        this.domain += '.cybozu.com';
    }

    this.apiToken = opts.apiToken;
    this.user = opts.user;
    this.password = opts.password;
    this.basicUser = opts.basicUser;
    this.basicPassword = opts.basicPassword;
    if (opts.encrypted) {
      opts.encrypted = opts.encrypted.toUpperCase();
    }
    this.encrypted = (opts.encrypted == 'TRUE' || opts.encrypted == 'YES');

    this.authHeaders = this.getAuthHeaders();
  }

  getConfig(name) {
    for (var i = 1; true; i++) {
      const config = process.env[`KINTONE_NAME_${i}`];

      if (!config) break;
      if (config == name) {
        return {
          domain: process.env[`KINTONE_DOMAIN_${i}`],
          apiToken: process.env[`KINTONE_API_TOKEN_${i}`],
          user: process.env[`KINTONE_USER_${i}`],
          password: process.env[`KINTONE_PASSWORD_${i}`],
          basicUser: process.env[`KINTONE_BASIC_USER_${i}`],
          basicPassword: process.env[`KINTONE_BASIC_PASSWORD_${i}`],
          id: process.env[`KINTONE_APP_ID_${i}`],
          encrypted: process.env[`KINTONE_ENCRYPTED_${i}`],
        };
      }
    }
    return {};
  }

  decrypt(encrypted) {
    if (!encrypted) {
      return Promise.resolve(null);
    }
    const kms = new AWS.KMS();

    const params = {
      CiphertextBlob: new Buffer(encrypted, 'base64')
    };

    return new Promise((resolve, reject) => {
      kms.decrypt(params, (err, data) => {
        if (err) {
          console.error(err);
          reject();
        } else {
          resolve(data.Plaintext.toString('ascii'));
        }
      });
    });
  }

  getAuthHeaders() {
    return new Promise((resolve, reject) => {
      if (this.encrypted) {
        var encryptedParams = [
          this.password,
          this.apiToken,
          this.basicPassword,
        ];

        Promise.all(encryptedParams.map((encrypted) => {
          return this.decrypt(encrypted);
        })).then((params) => {
          resolve(this._getAuthHeaders({
            user: this.user,
            password: params[0],
            apiToken: params[1],
            basicUser: this.basicUser,
            basicPassword: params[2],
          }));
        });
      } else {
        resolve(this._getAuthHeaders({
          user: this.user,
          password: this.password,
          apiToken: this.apiToken,
          basicUser: this.basicUser,
          basicPassword: this.basicPassword,
        }));
      }
    });
  }

  _getAuthHeaders(opt) {
    var headers = {};

    if (opt.basicUser) {
      let usernamePassword = opt.basicUser + ':' + opt.basicPassword;
      let base64 = new Buffer(usernamePassword).toString('base64');
      headers['Authorization'] = 'Basic ' + base64;
    }

    if (opt.user) {
      let usernamePassword = opt.user + ':' + opt.password;
      let base64 = new Buffer(usernamePassword).toString('base64');
      headers['X-Cybozu-Authorization'] = base64;
    }

    if (opt.apiToken) {
      headers['X-Cybozu-API-Token'] = opt.apiToken;
    }

    if (!headers.hasOwnProperty('X-Cybozu-API-Token') && !headers.hasOwnProperty('X-Cybozu-Authorization')) {
      throw new TypeError('Specify "token" or "authorization"');
    }
    return headers;
  }

  get(path, data, callback, errback) {
    return this.requestBase('GET', path, data, callback, errback);
  }

  post(path, data, callback, errback) {
    return this.requestBase('POST', path, data, callback, errback);
  }

  put(path, data, callback, errback) {
    return this.requestBase('PUT', path, data, callback, errback);
  }

  delete(path, data, callback, errback) {
    return this.requestBase('DELETE', path, data, callback, errback);
  }

  requestBase(method, path, data, callback, errback) {
    var options = {
      url: `https://${this.domain}${path}.json`,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };

    return new Promise((resolve, reject) => {
      this.authHeaders.then((headers) => {
        Object.assign(options.headers, headers);
        request(options, function(err, response, body) {
          if (err || response.statusCode != 200) {
            if (errback) errback(err);
            reject(err);
          } else {
            let json = JSON.parse(body);
            if (callback) callback(json);
            resolve(json);
          }
        });
      });
    });
  }

  upload(filename) {
    var options = {
      url: 'https://' + this.domain + '/k/v1/file.json',
      headers: {},
      method: 'POST',
      formData: {
        file: {
          value: fs.createReadStream(filename),
          options: {
            filename: path.basename(filename),
            contentType: 'application/octet-stream'
          }
        }
      }
    };

    return new Promise((resolve, reject) => {
      this.authHeaders.then((headers) => {
        Object.assign(options.headers, headers);
        request(options, function(err, response, body) {
          if (err || response.statusCode != 200) {
            reject(err);
          } else {
            resolve(JSON.parse(body));
          }
        });
      });
    });
  }

  download(fileKey, savePath) {
    var options = {
      url: 'https://' + this.domain + '/k/v1/file.json?fileKey=' + fileKey,
      headers: {},
      method: 'GET'
    };

    return new Promise((resolve, reject) => {
      this.authHeaders.then((headers) => {
        Object.assign(options.headers, headers);
        var file = fs.createWriteStream(savePath);
        request(options).pipe(file);

        file.on('finish', function() {
          file.close(function() {
            resolve(savePath);
          });
        });
        file.on('error', function(err) {
          reject(err);
        });
      });
    });
  }
};
