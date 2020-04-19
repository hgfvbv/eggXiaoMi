'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;

    //路由中间件
    let initMiddleware = app.middleware.init({}, app);
    
    router.get('/', initMiddleware, controller.default.index.index);
    router.get('/plist', initMiddleware, controller.default.product.list);
    router.get('/pinfo', initMiddleware, controller.default.product.info);
    router.get('/getImagelist',initMiddleware, controller.default.product.getImagelist);

    //用户中心

    router.get('/login', initMiddleware, controller.default.user.login);
    router.get('/register', initMiddleware, controller.default.user.register);
    router.get('/user', initMiddleware, controller.default.user.welcome);
    router.get('/user/order', initMiddleware, controller.default.user.order);

    //购物车
    router.get('/addCart', initMiddleware, controller.default.cart.addCart);
    router.get('/addCartSuccess', initMiddleware, controller.default.cart.addCartSuccess);
    router.get('/cart', initMiddleware, controller.default.cart.cart);
    router.get('/changeAllCart', initMiddleware, controller.default.cart.changeAllCart);
    router.get('/changeOneCart', initMiddleware, controller.default.cart.changeOneCart);
    router.get('/decCart', initMiddleware, controller.default.cart.decCart);
    router.get('/incCart', initMiddleware, controller.default.cart.incCart);
    router.get('/removeCart', initMiddleware, controller.default.cart.removeCart);
};
