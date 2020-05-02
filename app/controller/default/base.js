'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
    async error(redirectUrl, msg = '哎呀！网页开小差了！') {
        await this.ctx.render('default/public/error.htm', {
            redirectUrl,
            msg
        });
    }

    async verify() {
        let captcha = await this.service.tools.captcha(true, { fontSize: 50, width: 136, height: 43, mathOperator: '+', mathMin: 1, mathMax: 9, background: '#64C4EA' }, false);
        this.ctx.response.type = 'image/svg+xml';
        this.ctx.body = captcha.data;
    }

    async exit() {
        await this.ctx.render('admin/public/exit');
    }
}

module.exports = BaseController;
