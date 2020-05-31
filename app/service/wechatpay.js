'use strict';

const Service = require('egg').Service;
const wechatPay = require('../lib/wechatPay');
const qr = require('qr-image');

class WechatpayService extends Service {
    async doPay(orderData) {
        const { config, ctx } = this;

        return new Promise((resolve, reject) => {
            // console.log(config.weixinPayConfig);
            const pay = new wechatPay(config.weixinPayConfig);
            console.log(orderData);
            const ip = ctx.request.ip.replace(/::ffff:/, '');

            pay.createOrder({
                openid: '',
                notify_url: config.weixinpayBasicParams.notify_url, //微信支付完成后的回调
                out_trade_no: orderData.out_trade_no, //订单号
                attach: orderData.title,
                body: orderData.title,
                detail: orderData.detail,
                total_fee: orderData.price,
                spbill_create_ip: ip
            }, function (err, responseData) {
                if (err) {
                    let code_url = ctx.session.code_url || '哎呀！网页开小差了！要不稍后再试试？';
                    resolve(code_url);
                } else {
                    // 这里可能会出问题
                    if (responseData.code_url.indexOf('weixin') !== -1) {
                        ctx.session.code_url = responseData.code_url;
                        resolve(responseData.code_url);
                    } else {
                        resolve(ctx.session.code_url || responseData.code_url);
                    }
                }
            });
        });
    }

    async qrImage(url) {
        return qr.image(url, { type: 'png' });
    }

    wechatpayNotify(params) {
        const { config } = this;
        const pay = new wechatPay(config.weixinPayConfig);

        const notifyObj = params;
        const signObj = {};
        for (const attr in notifyObj) {
            if (attr != 'sign') {
                signObj[attr] = notifyObj[attr];
            }
        }
        return pay.getSign(signObj);
    }
}

module.exports = WechatpayService;
