'use strict';

const BaseController = require('./base');

class LoginController extends BaseController {
    async index() {
        await this.ctx.render('admin/login');
    }

    async doLogin() {
        const { ctx } = this;
        let params = ctx.request.body;

        if (params.username == '' || params.password == '' || params.verify == '') {
            await this.error('/admin/login', '对不起！服务器繁忙！要不稍后再试试？');
        }

        if (params.verify.toUpperCase() == ctx.session.code.toUpperCase()) {
            let password = await this.service.tools.md5(await this.service.tools.md5(params.password)),
                result = await ctx.model.Admin.find({ 'username': params.username, password });
            
            if (result && result.length > 0) {
                ctx.session.userinfo = result[0];
                ctx.redirect('/admin/manager');
            } else {
                await this.error('/admin/login', '用户名或密码错误！');
            }
        } else {
            await this.error('/admin/login', '验证码错误！');
        }
    }

    async loginOut() {
        this.ctx.session.userinfo = null;
        this.ctx.redirect('/admin/login');
    }
}

module.exports = LoginController;
