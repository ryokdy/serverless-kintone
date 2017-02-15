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

  describe('#post()', () => {
    it('should post records', () => {
      const opts = {
        name: 'test_app'
      }
      const kintone = new Kintone(opts);

      const params = {
        app: 6,
        record: {
          text: {value: 'test1'},
          multi_text: {value: 'aaabbb'}
        }
      }
      return kintone.post('/k/v1/record', params).then((res) => {
        expect(res.id).to.be.a('string');
      });
    });
  });

  describe('#put()', () => {
    it('should put records', () => {
      const opts = {
        name: 'test_app'
      }
      const kintone = new Kintone(opts);

      const params = {
        app: 6,
        id: 1,
        record: {
          text: {value: 'test2'}
        }
      }
      return kintone.put('/k/v1/record', params).then((res) => {
        expect(res.revision).to.be.a('string');
      });
    });
  });

  describe('#get()', () => {
    it('should get records', () => {
      const opts = {
        name: 'test_app'
      }
      const kintone = new Kintone(opts);

      return kintone.get('/k/v1/records', {app: 6}).then((res) => {
        expect(res.records).not.to.equal(0);
      });
    });
  });

  describe('#upload()', () => {
    it('should upload records', () => {
      const opts = {
        name: 'test_app'
      }
      const kintone = new Kintone(opts);

      return kintone.upload('/tmp/test.png').then((res) => {
        expect(res.fileKey).not.to.equal(0);
        const params = {
          app: 6,
          id: 1,
          record: {
            file: {value: [{fileKey:res.fileKey}]}
          }
        }
        return params;
      }).then((params) => {
        return kintone.put('/k/v1/record', params).then((res) => {
          expect(res.revision).to.be.a('string');
        });
      });
    });
  });

  describe('#download()', () => {
    it('should upload records', () => {
      const opts = {
        name: 'test_app'
      }
      const kintone = new Kintone(opts);

      const params = {
        app: 6,
        id: 1,
      }
      return kintone.get('/k/v1/record', params).then((res) => {
        return res.record.file.value[0].fileKey;
      }).then((fileKey) => {
        return kintone.download(fileKey, '/tmp/test1.png').then((res) => {
          expect(res).to.be.a('string');
        });
      });
    });
  });
});
