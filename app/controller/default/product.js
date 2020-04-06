'use strict';

const Controller = require('egg').Controller;

class ProductController extends Controller {
    async list() {
        const { ctx } = this;
        await ctx.render('/default/product_list.htm');
    }

    async info() {
        const { ctx } = this;
        await ctx.render('/default/product_info.htm');
    }
}

module.exports = ProductController;
