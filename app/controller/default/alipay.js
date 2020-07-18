'use strict';

const BaseController = require('./base');

class AlipayController extends BaseController {
    async pay() {
        const { ctx, service, config } = this;

        await this.error('/buy/checkout', '此网站为测试网站，支付接口已关闭！');
        return;

        const _id = ctx.query.id || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (_id === '' || uid === '') {
            await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }
        let orderResult = await ctx.model.Order.findOne({ _id, uid }, 'all_price order_id');
        if (orderResult) {
            // let orderItemResult = await ctx.model.OrderItem.find({ order_id: _id }, 'product_title product_color');

            let subject = 'hgfvbv-商城支付';
            // for (let i = 0; i < orderItemResult.length; i++) {
            //     const element = orderItemResult[i];
            //     if (i === orderItemResult.length - 1) {
            //         subject += element.product_title + ' ' + element.product_color;
            //     } else {
            //         subject += element.product_title + ' ' + element.product_color + ',';
            //     }
            // }

            // 支付宝参考 https://www.yuque.com/chenqiu/alipay-node-sdk/with_biz_content
            // https://opendocs.alipay.com/apis/api_1/alipay.trade.page.pay
            const data = {
                notifyUrl: config.alipayBasicParams.notifyUrl,
                returnUrl: config.alipayBasicParams.returnUrl,
                // 通过 bizContent 传递请求参数
                bizContent: {
                    subject,
                    outTradeNo: orderResult.order_id,
                    totalAmount: orderResult.all_price,
                    productCode: 'FAST_INSTANT_TRADE_PAY',
                },
            };

            const url = await service.alipay.doPay(data);
            ctx.redirect(url);
        } else {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
        }

    }

    async alipayReturn() {
        await this.error('/buy/checkout', '此网站为测试网站，支付接口已关闭！');
        return;

        // 跳转到订单页面
        this.ctx.redirect('/user/order');
    }

    //支付成功以后更新订单   必须正式上线
    async alipayNotify() {
        await this.error('/buy/checkout', '此网站为测试网站，支付接口已关闭！');
        return;
        const { ctx, service } = this;
        const params = ctx.request.body;
        console.log(params);
        const result = await service.alipay.alipayNotify(params);
        console.log('-------------');
        console.log(result);
        if (result.code === 0 && params.trade_status == 'TRADE_SUCCESS') {
            //更新订单

        }
    }
}

module.exports = AlipayController;
