'use strict';

const fs = require('fs-extra');
const path = require('path');
const request = require('request');

module.exports = class Kintone {
  constructor(opts) {
    if (typeof opts === 'string') {
      opts = this.getConfig(opts);
    }
    opts = opts || {};
    this.domain = opts.domain;
    if (!this.domain.match('\\.')) {
        this.domain += '.cybozu.com';
    }

    this.apiToken = opts.apiToken;
    this.user = opts.user;
    this.password = opts.password;
    this.basicUser = opts.basicUser;
    this.basicPassword = opts.basicPassword;

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
          basicUser: process.env[`KINTONE_BASIC_USER_${i}`],
          basicPassword: process.env[`KINTONE_BASIC_PASSWORD_${i}`],
        };
      }
    }
    return {};
  }

  getAuthHeaders() {
    var headers = {};

    if (this.basicUser) {
      let usernamePassword = this.basicUser + ':' + this.basicPassword;
      let base64 = new Buffer(usernamePassword).toString('base64');
      headers['Authorization'] = 'Basic ' + base64;
    }

    if (this.user) {
      let usernamePassword = this.user + ':' + this.password;
      let base64 = new Buffer(usernamePassword).toString('base64');
      headers['X-Cybozu-Authorization'] = base64;
    }

    if (this.apiToken) {
      headers['X-Cybozu-API-Token'] = this.apiToken;
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

    Object.assign(options.headers, this.authHeaders);

    return new Promise((resolve, reject) => {
      request(options, function(err, response, body) {
        if (err) {
          if (errback) errback(err);
          reject(err);
        } else {
          let json = JSON.parse(body);
          if (callback) callback(json);
          resolve(json);
        }
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

    Object.assign(options.headers, this.authHeaders);

    return new Promise((resolve, reject) => {
      request(options, function(err, response, body) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }

  download(fileKey, savePath) {
    var options = {
      url: 'https://' + this.domain + '/k/v1/file.json?fileKey=' + fileKey,
      headers: {},
      method: 'GET'
    };

    Object.assign(options.headers, this.authHeaders);
    var file = fs.createWriteStream(savePath);
    request(options).pipe(file);

    return new Promise((resolve, reject) => {
      file.on('finish', function() {
        file.close(function() {
          resolve(savePath);
        });
      });
      file.on('error', function(err) {
        reject(err);
      });
    });
  }
};
