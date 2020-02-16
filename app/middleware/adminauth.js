const url = require('url');

module.exports = (options, app) => {
    return async (ctx, next) => {
        ctx.state.csrf = ctx.csrf;

        if (ctx.session.userinfo) {
            ctx.state.userinfo = ctx.session.userinfo;
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