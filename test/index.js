'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const Serverless = require('serverless/lib/Serverless');
const AwsProvider = require('serverless/lib/plugins/aws/provider/awsProvider');
const BbPromise = require('bluebird');
const Kintone = require('./../index');

describe('ServerlessKintone', () => {
  let serverless;
  let kintone;

  beforeEach(() => {
    serverless = new Serverless();
    serverless.servicePath = true;
    serverless.service.environment = {
      vars: {},
      stages: {
        dev: {
          vars: {},
          regions: {
            'us-east-1': {
              vars: {},
            },
          },
        },
      },
    };
    serverless.service.functions = {
      hello: {
        handler: true,
      },
    };
    const options = {
      stage: 'dev',
      region: 'us-east-1',
      function: 'hello',
      functionObj: {
        name: 'hello',
      },
    };
    serverless.init();
    serverless.setProvider('aws', new AwsProvider(serverless));
    kintone = new Kintone(serverless, options);
  });

  describe('#constructor()', () => {
    it('should have hooks', () => expect(kintone.hooks).to.be.not.empty);

    it('should run promise chain in order for before:deploy:function:deploy', () => {
      const validateStub = sinon
        .stub(kintone, 'validate').returns(BbPromise.resolve());
      const addLibrariesStub = sinon
        .stub(kintone, 'addLibraries').returns(BbPromise.resolve());

      return kintone.hooks['before:deploy:function:packageFunction']().then(() => {
        expect(validateStub.calledOnce).to.equal(true);
        expect(addLibrariesStub.calledAfter(validateStub))
          .to.equal(true);

        kintone.validate.restore();
        kintone.addLibraries.restore();
      });
    });

    it('should run promise chain in order for after:deploy:function:deploy', () => {
      const validateStub = sinon
        .stub(kintone, 'validate').returns(BbPromise.resolve());
      const removeLibrariesStub = sinon
        .stub(kintone, 'removeLibraries').returns(BbPromise.resolve());

      return kintone.hooks['after:deploy:function:deploy']().then(() => {
        expect(validateStub.calledOnce).to.equal(true);
        expect(removeLibrariesStub.calledAfter(validateStub))
          .to.equal(true);

        kintone.validate.restore();
        kintone.removeLibraries.restore();
      });
    });

    it('should run promise chain in order for before:deploy:createDeploymentArtifacts', () => {
      const validateStub = sinon
        .stub(kintone, 'validate').returns(BbPromise.resolve());
      const addLibrariesStub = sinon
        .stub(kintone, 'addLibraries').returns(BbPromise.resolve());

      return kintone.hooks['before:deploy:createDeploymentArtifacts']().then(() => {
        expect(validateStub.calledOnce).to.equal(true);
        expect(addLibrariesStub.calledAfter(validateStub))
          .to.equal(true);

        kintone.validate.restore();
        kintone.addLibraries.restore();
      });
    });

    it('should run promise chain in order for after:deploy:deploy', () => {
      const validateStub = sinon
        .stub(kintone, 'validate').returns(BbPromise.resolve());
      const removeLibrariesStub = sinon
        .stub(kintone, 'removeLibraries').returns(BbPromise.resolve());

      return kintone.hooks['after:deploy:deploy']().then(() => {
        expect(validateStub.calledOnce).to.equal(true);
        expect(removeLibrariesStub.calledAfter(validateStub))
          .to.equal(true);

        kintone.validate.restore();
        kintone.removeLibraries.restore();
      });
    });

    it('should run promise chain in order for before:deploy:resources', () => {
      const setEnvStub = sinon
        .stub(kintone, 'setEnv').returns(BbPromise.resolve());

      return kintone.hooks['before:deploy:compileFunctions']().then(() => {
        expect(setEnvStub.calledOnce).to.equal(true);

        kintone.setEnv.restore();
      });
    });

  });

  describe('#addLibraries()', () => {

  });
});
