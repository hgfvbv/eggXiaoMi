'use strict';

const Controller = require('egg').Controller;

class HelpController extends Controller {
    async index() {
        const { ctx } = this;
        ctx.body = '帮助中心';
    }

    async info() {
        const { ctx } = this;
        ctx.body = '帮助详情';
    }
}

module.exports = HelpController;
