'use strict';

const BaseController = require('./base');

class LoginController extends BaseController {
    async index() {
        await this.ctx.render('admin/login');
    }

    async doLogin() {
        const { ctx } = this;
        let params = ctx.request.body,
            username = params.username ? params.username.trim() : '',
            password = params.password ? params.password.trim() : '',
            verify = params.verify ? params.verify.trim() : '';

        if (username == '' || password == '' || verify == '') {
            await this.error('/admin/login', '对不起！服务器繁忙！要不稍后再试试？');
        }

        if (verify.toUpperCase() == ctx.session.code.toUpperCase()) {
            password = await this.service.tools.md5(await this.service.tools.md5(password));
            let result = await ctx.model.Admin.find({ username, password });

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
