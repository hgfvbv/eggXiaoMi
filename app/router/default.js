'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;

    //路由中间件
    let initMiddleware = app.middleware.init({}, app);
    let userauthMiddleware = app.middleware.userauth({}, app);

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
};
