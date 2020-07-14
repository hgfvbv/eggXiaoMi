'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;

    //路由中间件
    let initMiddleware = app.middleware.init({}, app);
    let userauthMiddleware = app.middleware.userauth({}, app);
    let xmlparseMiddleware = app.middleware.xmlparse({}, app);

    router.get('/', initMiddleware, controller.default.index.index);
    router.get('/plist', initMiddleware, controller.default.product.list);
    router.get('/pinfo', initMiddleware, controller.default.product.info);
    router.get('/getImagelist', initMiddleware, controller.default.product.getImagelist);

    //购物车
    router.get('/addCart', initMiddleware, controller.default.cart.addCart);
    router.get('/addCartSuccess', initMiddleware, controller.default.cart.addCartSuccess);
    router.get('/cart', initMiddleware, controller.default.cart.cart);
    router.get('/changeAllCart', initMiddleware, controller.default.cart.changeAllCart);
    router.get('/changeOneCart', initMiddleware, controller.default.cart.changeOneCart);
    router.get('/decCart', initMiddleware, controller.default.cart.decCart);
    router.get('/incCart', initMiddleware, controller.default.cart.incCart);
    router.get('/removeCart', initMiddleware, controller.default.cart.removeCart);

    //用户注册登录
    router.get('/login', initMiddleware, controller.default.pass.login);
    router.post('/pass/doLogin', initMiddleware, controller.default.pass.doLogin);
    router.get('/pass/loginOut', initMiddleware, controller.default.pass.loginOut);
    router.get('/register/registerStep1', initMiddleware, controller.default.pass.registerStep1);
    router.get('/pass/sendCode', initMiddleware, controller.default.pass.sendCode);
    router.get('/register/registerStep2', initMiddleware, controller.default.pass.registerStep2);
    router.get('/pass/validatePhoneCode', initMiddleware, controller.default.pass.validatePhoneCode);
    router.get('/register/registerStep3', initMiddleware, controller.default.pass.registerStep3);
    router.post('/pass/doRegister', initMiddleware, controller.default.pass.doRegister);

    //验证码
    router.get('/verify', initMiddleware, controller.default.base.verify);

    //去结算
    router.get('/buy/checkout', initMiddleware, userauthMiddleware, controller.default.buy.checkout);
    //提交订单
    router.post('/buy/doOrder', initMiddleware, userauthMiddleware, controller.default.buy.doOrder);
    //确认订单去支付
    router.get('/buy/confirm', initMiddleware, userauthMiddleware, controller.default.buy.confirm);

    //支付
    router.get('/alipay/pay', initMiddleware, userauthMiddleware, controller.default.alipay.pay);
    //支付成功回调
    router.get('/alipay/alipayReturn', initMiddleware, controller.default.alipay.alipayReturn);
    //支付成功异步通知   注意关闭csrf验证
    router.post('/alipay/alipayNotify', initMiddleware, xmlparseMiddleware, controller.default.alipay.alipayNotify);
    // 微信支付
    router.get('/weChatPay/pay', initMiddleware, userauthMiddleware, controller.default.weChatPay.pay);
    //异步通知   注意关闭csrf验证
    router.post('/weChatPay/weChatPayNotify', initMiddleware, xmlparseMiddleware, controller.default.weChatPay.weChatPayNotify);

    //检测订单是否支付
    router.get('/buy/getOrderPayStatus', initMiddleware, userauthMiddleware, controller.default.buy.getOrderPayStatus);

    // address   收货地址（api接口）
    router.post('/user/addAddress', initMiddleware, userauthMiddleware, controller.default.address.addAddress);
    router.get('/user/getOneAddressList', initMiddleware, userauthMiddleware, controller.default.address.getOneAddressList);
    router.get('/user/changeDefaultAddress', initMiddleware, userauthMiddleware, controller.default.address.changeDefaultAddress);
    router.post('/user/editAddress', initMiddleware, userauthMiddleware, controller.default.address.editAddress);
    router.get('/user/delAddress', initMiddleware, userauthMiddleware, controller.default.address.delAddress);

    // 用户中心
    router.get(['/user', '/user/welcome'], initMiddleware, userauthMiddleware, controller.default.user.welcome);
    router.get('/user/order', initMiddleware, userauthMiddleware, controller.default.user.order);
    router.get('/user/orderinfo', initMiddleware, userauthMiddleware, controller.default.user.orderinfo);

    router.get('/search', controller.default.search.index);
};
