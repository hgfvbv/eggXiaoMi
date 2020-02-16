'use strict';

const svgCaptcha = require('svg-captcha'),
    md5 = require('md5'),
    Service = require('egg').Service;

class ToolsService extends Service {
    async captcha(isMath, params = { size: 4, fontSize: 50, width: 100, height: 32, noise: 1, background: '#cc9966', color: false, mathOperator: '', mathMin: 1, mathMax: 9 }) {

        if (params.color) {
            delete params.background;
        }
        if (params.mathOperator == '') {
            delete params.mathOperator;
            delete params.mathMin;
            delete params.mathMax;
        }

        let captcha;
        if (isMath) {
            captcha = svgCaptcha.createMathExpr(params);
        } else {
            captcha = svgCaptcha.create(params);
        }

        this.ctx.session.code = captcha.text;
        return captcha;
    }

    async md5(val) {
        return md5(val);
    }

    async getTime() {
        let date = new Date();
        return date.getTime();
    }
}

module.exports = ToolsService;
