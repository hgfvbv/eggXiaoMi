'use strict';

const BaseController = require('./base');

class NavController extends BaseController {
    async index() {
        const { ctx, config } = this;

        let params = ctx.query,
            title = params.title ? params.title.trim() : '',
            page = params.page ? params.page : 1,
            pageSize = config.pageSize ? config.pageSize : 10,
            where = {};

        if (title && title != '') {
            //模糊查询
            where = {
                $or: [
                    { title: { $regex: title } }
                ]
            };
        };

        let totalCount = await ctx.model.Nav.find(where).count();
        let pageCount = Math.ceil(totalCount / pageSize);
        let list = await ctx.model.Nav.find(where).skip((page - 1) * pageSize).limit(pageSize).sort({ sort: 1 });
        await ctx.render('admin/nav/index', { params, list, page, pageCount });
    }

    async add() {
        await this.ctx.render('/admin/nav/add');
    }

    async doAdd() {
        const { ctx } = this;
        let params = ctx.request.body,
            title = params.title ? params.title.trim() : '',
            relation = params.relation ? params.relation.trim().replace('，', ',') : '',
            link = params.link ? params.link.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            status = params.status ? 1 : 0;

        let num = /^\d+$/;

        if (title == '' || link == '' || sort == '' || !num.test(sort)) {
            await this.error('/admin/nav/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let nav = new ctx.model.Nav({
            title,
            relation,
            link,
            position: params.position,
            is_opennew: params.is_opennew,
            sort,
            status,
            add_time: await ctx.service.tools.getTime()
        });

        try {
            await nav.save();
            await ctx.redirect('/admin/nav');
        } catch (err) {
            await this.error('/admin/nav/add', '增加导航失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error(ctx.state.prevPage, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.Nav.find(where);

        await this.ctx.render('/admin/nav/edit', { result: result[0], prevPage: ctx.state.prevPage });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            relation = params.relation ? params.relation.trim().replace('，', ',') : '',
            link = params.link ? params.link.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            status = params.status ? 1 : 0,
            prevPage = params.prevPage ? params.prevPage : '/admin/nav',
            where = {},
            uParams = {};

        if (id == '') {
            await this.error(prevPage, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let num = /^\d+$/;

        if (title == '' || link == '' || sort == '' || !num.test(sort)) {
            await this.error(`/admin/nav/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            title,
            relation,
            link,
            position: params.position,
            is_opennew: params.is_opennew,
            sort,
            status
        };

        let nav = await ctx.model.Nav.updateOne(where, uParams);

        if (nav.nModified > 0) {
            await ctx.redirect(prevPage);
        } else {
            await this.error(`/admin/nav/edit?id=${id}`, '编辑导航失败！');
        }
    }
}

module.exports = NavController;
