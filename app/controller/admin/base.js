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
}

module.exports = BaseController;
