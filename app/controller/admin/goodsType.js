'use strict';

const BaseController = require('./base');

class GoodsTypeController extends BaseController {
    async index() {
        const { ctx } = this;

        let params = ctx.query,
            title = params.title ? params.title.trim() : '',
            where = {};

        if (title && title != '') {
            //模糊查询
            where = {
                $or: [
                    { title: { $regex: title } }
                ]
            };
        };

        let list = await ctx.model.GoodsType.find(where);
        await ctx.render('admin/goodsType/index', { params, list });
    }

    async add() {
        await this.ctx.render('admin/goodsType/add');
    }

    async doAdd() {
        const { ctx } = this;
        let params = ctx.request.body,
            title = params.title ? params.title.trim() : '',
            description = params.description ? params.description.trim() : '';

        if (title == '') {
            await this.error('/admin/goodsType/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let goodsType = new ctx.model.GoodsType({
            title,
            description,
            status: params.status ? 1 : 0,
            add_time: await ctx.service.tools.getTime()
        });

        try {
            goodsType = await goodsType.save();
            await ctx.redirect('/admin/goodsType');
        } catch (err) {
            await this.error('/admin/goodsType/add', '增加商品类型失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/goodsType', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.GoodsType.find(where);
        await this.ctx.render('admin/goodsType/edit', { result: result[0] });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            description = params.description ? params.description.trim() : '',
            where = {},
            uParams = {};

        if (id == '') {
            await this.error('/admin/goodsType', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (title == '') {
            await this.error(`/admin/goodsType/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            title: title,
            description: description,
            status: params.status ? 1 : 0
        };

        let goodsType = await ctx.model.GoodsType.updateOne(where, uParams);

        if (goodsType.ok > 0) {
            await ctx.redirect('/admin/goodsType');
        } else {
            await this.error(`/admin/goodsType/edit?id=${id}`, '编辑商品类型失败！');
        }
    }
}

module.exports = GoodsTypeController;
