'use strict';

const BbPromise = require('bluebird');
const validate = require('serverless/lib/plugins/aws/lib/validate');
const addLibraries = require('./lib/addLibraries');
const removeLibraries = require('./lib/removeLibraries');
const setEnv = require('./lib/setEnv');

module.exports = class ServerlessKintone {

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};

    Object.assign(this, validate, addLibraries, removeLibraries, setEnv);

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
      'after:deploy:deploy': () => BbPromise.bind(this)
        .then(this.validate)
        .then(this.removeLibraries),
      'before:deploy:compileFunctions': () => BbPromise.bind(this)
        .then(this.setEnv)
    };
  }
};
