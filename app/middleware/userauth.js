const url = require('url');

module.exports = (options, app) => {
    return async function userauth(ctx, next) {

        //判断前台用户是否登录   如果登录可以进入 （ 去结算  用户中心）    如果没有登录直接跳转到登录
        const userInfo = ctx.service.cookies.get('userInfo');
        ctx.state.url = url.parse(ctx.request.url).pathname;

        if (userInfo && userInfo._id && userInfo.phone) {
            //判断数据库里面有没有当前用户                
            let user = await ctx.model.User.findOne({ "_id": userInfo._id, "phone": userInfo.phone, status: 1 });

            if (user) {
                await next();
            } else {
                ctx.service.cookies.set('userInfo', '');
                const req = ctx.request;
                const prevPage = 'http://' + req.headers.host + req.url;
                ctx.redirect('/login?returnUrl=' + encodeURIComponent(prevPage));
            }
        } else {
            const req = ctx.request;
            const prevPage = 'http://' + req.headers.host + req.url;
            ctx.redirect('/login?returnUrl=' + encodeURIComponent(prevPage));
        }
    };
};
