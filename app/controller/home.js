'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.render('index/home.nj', { username: '张三' });
  }
}

module.exports = HomeController;
