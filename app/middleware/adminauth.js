const url = require('url');

module.exports = (options, app) => {
    return async (ctx, next) => {
        ctx.state.csrf = ctx.csrf;
        ctx.state.prevPage = ctx.request.headers['referer']; //上一页的地址

        if (ctx.session.userinfo) {
            ctx.state.userinfo = ctx.session.userinfo;
            ctx.state.roleTitle = ctx.session.roleTitle;
            await next();
        } else {
            let pathname = url.parse(ctx.request.url).pathname;
            if (pathname == '/admin/login' || pathname == '/admin/doLogin' || pathname == '/admin/verify') {
                await next();
            } else {
                await ctx.redirect('/admin/login');
            }
        }
    };
}