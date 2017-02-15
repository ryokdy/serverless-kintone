'use strict';

const expect = require('chai').expect;
const Kintone = require('./../dists/kintone');

describe('kintone', () => {
  describe('#constructor()', () => {
    it('should initialize from parameters', () => {
      const opts = {
        domain: process.env.KINTONE_DOMAIN_1,
        apiToken: process.env.KINTONE_API_TOKEN_1
      }
      const kintone = new Kintone(opts);
      expect(kintone.domain).to.equal(`${process.env.KINTONE_DOMAIN_1}.cybozu.com`);
      expect(kintone.apiToken).to.equal(process.env.KINTONE_API_TOKEN_1);
    });

    it('should initialize from environtment variables', () => {
      const opts = {
        name: 'test_app'
      }
      const kintone = new Kintone(opts);
      expect(kintone.domain).to.equal(`${process.env.KINTONE_DOMAIN_1}.cybozu.com`);
      expect(kintone.apiToken).to.equal(process.env.KINTONE_API_TOKEN_1);
    });
  });

  describe('#get()', () => {
    it('should initialize from parameters', () => {
      const opts = {
        name: 'test_app'
      }
      const kintone = new Kintone(opts);

      return kintone.get('/k/v1/records', {app: 6}).then((res) => {
        expect(res.records).not.to.equal(0);
      });
    });
  });
});
