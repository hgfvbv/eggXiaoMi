'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
    async index() {
        await this.ctx.render('admin/index');
    }

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
        let params = ctx.request.query,
            model = params.model,
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

    //改变状态的方法  Api接口
    async changeStatus() {
        const { ctx } = this;
        let params = ctx.request.body,
            model = params.model,
            id = params.id ? params.id.trim() : '',
            attr = params.attr ? params.attr.trim() : '',
            where = {};

        if (id == '' || attr == '') {
            ctx.body = { 'message': '对不起！服务器繁忙！要不稍后再试试？', 'success': false };
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model[model].findOne(where);
        if (result) {
            let json = {};
            if (result[attr] == 0) {
                //es6 属性表达式
                //相当于：attr=status;  json={status:1}
                json = {
                    [attr]: 1
                };
            } else {
                json = {
                    [attr]: 0
                };
            }

            let updateResult = await ctx.model[model].updateOne(where, json);

            if (updateResult.nModified > 0) {
                ctx.body = { 'message': '更新成功', 'success': true };
            } else {
                ctx.body = { 'message': '更新失败', 'success': false };
            }
        } else {
            ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        }
    }
}

module.exports = BaseController;
