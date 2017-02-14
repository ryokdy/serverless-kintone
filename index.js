'use strict';

const BbPromise = require('bluebird');
const validate = require('serverless/lib/plugins/aws/lib/validate');
const fs = require('fs-extra');
const path = require('path');

module.exports = exports = class ServerlessKintone {

  constructor(serverless, options) {
    this._serverless = serverless;
    this.commands = {
      deploy: {
        lifecycleEvents: [
          'resources'
        ]
      }
    };

    this.hooks = {
      'before:deploy:function:deploy': () => BbPromise.bind(this)
        .then(this.validate)
        .then(this.addLibraries),
      'after:deploy:function:deploy': () => BbPromise.bind(this)
        .then(this.validate)
        .then(this.removeLibraries),
      'before:deploy:createDeploymentArtifacts': () => BbPromise.bind(this)
        .then(this.validate)
        .then(this.addLibraries),
      'before:deploy:resources': this.beforeDeployResources.bind(this)
    };
  }

  addLibraries() {
    fs.copySync(
      path.join(path.dirname(__dirname), 'dists'),
      this.serverless.config.servicePath);
    return BbPromise.resolve();
  }

  removeLibraries() {
    fs.removeSync(path.join(this.serverless.config.servicePath, 'kintone'));
    return BbPromise.resolve();
  }

  beforeDeployResources() {

    let kintoneProperties = [];
    if (this._serverless.service.custom && this._serverless.service.custom.kintone) {
      kintoneProperties = Object.keys(this._serverless.service.custom.kintone);
    }

    if (!this._serverless.service.provider.environment) {
      this._serverless.service.provider.environment = {};
    }

    const env = this._serverless.service.provider.environment;

    kintoneProperties.forEach((name, i) => {
      const props = this._serverless.service.custom.kintone[name];
      env[`KINTONE-APP-${i}`] = name;

      Object.keys(props).forEach((prop) => {
        env[`KINTONE-${prop.toUpperCase()}-${i}`] = props[prop];
      });
    });

    return Promise.resolve();
  }

};
