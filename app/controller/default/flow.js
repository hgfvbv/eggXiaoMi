'use strict';

const Controller = require('egg').Controller;

class FlowController extends Controller {
    async cart() {
        const { ctx } = this;
        await ctx.render('/default/cart.htm');
    }
}

module.exports = FlowController;
