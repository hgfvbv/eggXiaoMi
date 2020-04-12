'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;

    //路由中间件
    let initMiddleware = app.middleware.init({}, app);
    
    router.get('/', initMiddleware, controller.default.index.index);
    router.get('/cart', initMiddleware, controller.default.flow.cart);
    router.get('/plist', initMiddleware, controller.default.product.list);
    router.get('/pinfo', initMiddleware, controller.default.product.info);

    //用户中心

    router.get('/login', initMiddleware, controller.default.user.login);
    router.get('/register', initMiddleware, controller.default.user.register);
    router.get('/user', initMiddleware, controller.default.user.welcome);
    router.get('/user/order', initMiddleware, controller.default.user.order);

};
