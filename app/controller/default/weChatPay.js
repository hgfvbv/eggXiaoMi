'use strict';

const BaseController = require('./base');
// cnpm install request crypto xml2js --save
const xml2js = require('xml2js').parseString;

class WeChatPayController extends BaseController {
    async pay() {
        await this.error('/buy/checkout', '此网站为测试网站，支付接口已关闭！');
        return;
        const { ctx, service } = this;
        const _id = ctx.query.id || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (_id === '' || uid === '') {
            await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }
        let orderResult = await ctx.model.Order.findOne({ _id, uid }, 'all_price order_id');
        if (orderResult) {
            let orderItemResult = await ctx.model.OrderItem.find({ order_id: _id }, 'product_title product_color');

            let detail = '';
            for (let i = 0; i < orderItemResult.length; i++) {
                const element = orderItemResult[i];
                if (i === orderItemResult.length - 1) {
                    detail += element.product_title + ' ' + element.product_color;
                } else {
                    detail += element.product_title + ' ' + element.product_color + ',';
                }
            }

            const data = {
                title: 'hgfvbv-商城支付',
                detail,
                out_trade_no: orderResult.order_id,
                price: (orderResult.all_price * 100).toString(),    // 单位为分，所以乘以1004
            };

            const code_url = await service.wechatpay.doPay(data);
            const qrImage = await service.wechatpay.qrImage(code_url);
            ctx.type = 'image/png';
            ctx.body = qrImage;
        } else {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
        }

    }

    //支付成功以后更新订单   必须正式上线
    async weChatPayNotify() {
        await this.error('/buy/checkout', '此网站为测试网站，支付接口已关闭！');
        return;
        const { ctx, service } = this;
        let data = '';
        ctx.req.on('data', function (chunk) {
            data += chunk;
        });
        ctx.req.on('end', function () {
            xml2js(data, { explicitArray: false }, function (err, json) {
                //这里的json便是xml转为json的内容
                console.log(json);
                const mySign = service.wechatpay.wechatpayNotify(json.xml);
                console.log(mySign);
                console.log('------------------------');
                console.log(json.xml.sign);
                // 两个sign进行对比，如果一致，更新订单

            });
        });
    }
}

module.exports = WeChatPayController;
