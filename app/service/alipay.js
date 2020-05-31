'use strict';

const Service = require('egg').Service;
const AlipaySdk = require('alipay-sdk').default;

class AlipayService extends Service {
    async doPay(orderData) {
        const { config } = this;

        return new Promise((resolve, reject) => {
            console.log(config.alipayOptions);
            const alipaySdk = new AlipaySdk(config.alipayOptions);
            console.log(orderData);
            alipaySdk.exec('alipay.trade.page.pay', orderData)
                .then(result => {
                    console.log(result.data)
                    console.log(result);
                    resolve(result.data);
                }).catch(err => {
                    // console.log(err);
                    resolve(err.serverResult.headers.location);
                });
        });
    }

    async alipayNotify(params) {
        const { config } = this;
        // 验证订单是否正确
        // const alipaySdk = new AlipaySdk(config.alipayOptions);
        // 需要先把验签的字符串消息转换为 Object 对象
        // return service.checkNotifySign(params);
    }
}

module.exports = AlipayService;
