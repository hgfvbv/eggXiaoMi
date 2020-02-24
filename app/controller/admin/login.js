'use strict';

const BaseController = require('./base');

class LoginController extends BaseController {
    async index() {
        await this.ctx.render('/admin/login');
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
                let userinfo = result[0];
                if (userinfo.status == 1) {
                    let roleTitle = (await ctx.model.Role.findOne({ _id: userinfo.role_id }, { title: 1 })).title;
                    ctx.session.userinfo = userinfo;
                    ctx.session.roleTitle = roleTitle;
                    ctx.redirect('/admin');
                } else {
                    await this.error('/admin/login', '对不起！您已被锁定！请联系管理员！');
                }
            } else {
                await this.error('/admin/login', '用户名或密码错误！');
            }
        } else {
            await this.error('/admin/login', '验证码错误！');
        }
    }

    async loginOut() {
        this.ctx.session.userinfo = null;
        this.ctx.session.roleTitle = null;
        this.ctx.redirect('/admin/login');
    }
}

module.exports = LoginController;
