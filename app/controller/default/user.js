'use strict';

const BaseController = require('./base');

class UserController extends BaseController {
    async order() {
        const { ctx } = this;
        await ctx.render('/default/order.htm');
    }
}

module.exports = UserController;
