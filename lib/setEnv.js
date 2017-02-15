'use strict';

const BbPromise = require('bluebird');

module.exports = {
  setEnv() {
    let kintoneProperties = [];
    if (this.serverless.service.custom && this.serverless.service.custom.kintone) {
      kintoneProperties = this.serverless.service.custom.kintone;
    }

    if (!this.serverless.service.provider.environment) {
      this.serverless.service.provider.environment = {};
    }

    const env = this.serverless.service.provider.environment;

    kintoneProperties.forEach((app, i) => {
      Object.keys(app).forEach((prop) => {
        env[`KINTONE_${prop.toUpperCase()}_${i + 1}`] = app[prop];
      });
    });

    return BbPromise.resolve();
  },
};
