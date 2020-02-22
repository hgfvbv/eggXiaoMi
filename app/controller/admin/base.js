'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
    async success(redirectUrl, msg = '操作成功') {
        await this.ctx.render('admin/public/success', {
            redirectUrl,
            msg
        });
    }

    async error(redirectUrl, msg = '操作失败') {
        await this.ctx.render('admin/public/error', {
            redirectUrl,
            msg
        });
    }

    async verify() {
        let captcha = await this.service.tools.captcha(true, { fontSize: 50, width: 150, height: 32, mathOperator: '+', mathMin: 1, mathMax: 9, background: '#64C4EA' });
        this.ctx.response.type = 'image/svg+xml';
        this.ctx.body = captcha.data;
    }

    async delete() {
        const { ctx } = this;
        let model = ctx.request.query.model,
            params = ctx.request.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error(ctx.state.prevPage, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model[model].deleteOne(where);
        if (result.deletedCount > 0) {
            await ctx.redirect(ctx.state.prevPage);
        } else {
            await this.error(ctx.state.prevPage, '删除角色失败！');
        }
    }
}

module.exports = BaseController;
