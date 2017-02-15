'use strict';

module.exports = class Kintone {
  constructor(opt) {
    if (opt.name) {
      this.domain = process.env.domain;
    }
    this.domain = opt.domain;
    this.apiToken = opt.apiToken;
    this.userName = opt.userName;
    this.password = opt.password;
    this.basicUser = opt.basicUser;
    this.basicPassword = opt.basicPassword;
  }
};
