'use strict';

const expect = require('chai').expect;
const setEnv = require('./../lib/setEnv');

describe('setEnv()', () => {
  beforeEach(() => {
    setEnv.serverless = {
      service: {
        custom: {
          kintone: [
            {
              app: "test_app1",
              domain: "test1.cybozu.com",
              api_key: "key1",
              basic_user: "kintone1",
              basic_password: "password1"
            },
            {
              app: "test_app2",
              domain: "test2.cybozu.com",
              api_key: "key2",
              basic_user: "kintone2",
              basic_password: "password2"
            }
          ]
        },
        provider: {
          name: "aws",
        },
      },
    };
  });

  it('should set environment variables', () => {
    setEnv.setEnv().then(() => {
      const env = setEnv.serverless.service.provider.environment;
      expect(env['KINTONE_APP_1']).to.equal('test_app1');
      expect(env['KINTONE_DOMAIN_1']).to.equal('test1.cybozu.com');
      expect(env['KINTONE_API_KEY_1']).to.equal('key1');
      expect(env['KINTONE_APP_2']).to.equal('test_app2');
      expect(env['KINTONE_BASIC_USER_2']).to.equal('kintone2');
      expect(env['KINTONE_BASIC_PASSWORD_2']).to.equal('password2');

    });
  });
});
