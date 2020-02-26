const url = require('url');

module.exports = (options, app) => {
    return async (ctx, next) => {
        ctx.state.csrf = ctx.csrf;
        ctx.state.prevPage = ctx.request.headers['referer']; //上一页的地址

        if (ctx.session.userinfo) {
            ctx.state.userinfo = ctx.session.userinfo;
            ctx.state.roleTitle = ctx.session.roleTitle;

            let isSuccess = await ctx.service.admin.checkAuth();
            if (isSuccess) {
                ctx.state.asideList = await ctx.service.admin.getAuthList();
                await next();
            } else {
                await ctx.render('admin/public/error', {
                    redirectUrl: '/admin',
                    msg: '对不起！您无此权限！如有疑问可联系管理员！'
                });
            }
        } else {
            let pathname = url.parse(ctx.request.url).pathname;
            if (app.config.loginFilter.indexOf(pathname) != -1) {
                await next();
            } else {
                await ctx.redirect('/admin/login');
            }
        }
    };
}