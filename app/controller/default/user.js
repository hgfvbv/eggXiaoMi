'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
    async login() {
        const { ctx } = this;
        await ctx.render('/default/login.htm');
    }

    async register() {
        const { ctx } = this;
        await ctx.render('/default/register.htm');
    }

    async welcome() {
        const { ctx } = this;
        await ctx.render('/default/user.htm');
    }

    async order() {
        const { ctx } = this;
        await ctx.render('/default/order.htm');
    }
}

module.exports = UserController;
