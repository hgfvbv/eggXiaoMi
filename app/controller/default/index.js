'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index() {
        const { ctx } = this;
        await ctx.render('/default/index.htm');
    }
}

module.exports = IndexController;
