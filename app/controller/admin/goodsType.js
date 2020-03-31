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

    async changeStatus() {
        const { ctx, config } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            ctx.body = { 'message': '对不起！服务器繁忙！要不稍后再试试？', 'success': false };
            return;
        }

        where = {
            _id: id
        };
console.log(id)
        ctx.body = { 'message': '更新成功', 'success': true };
        // let result = await ctx.model.Role.findOne(where);
        // if (result) {
        //     let uParams = result.status == 0 ? { status: 1 } : { status: 0 };

        //     let role = await ctx.model.Role.updateOne(where, uParams);

        //     if (role.nModified > 0) {
        //         if (uParams.status == 0) {
        //             let uResult = await ctx.model.Admin.updateMany({ role_id: id }, { role_id: config.rwait, status: 0 });
        //             if (uResult.ok > 0) {
        //                 ctx.body = { 'message': '更新成功', 'success': true };
        //             } else {
        //                 ctx.body = { 'message': '更新失败', 'success': false };
        //             }
        //         } else {
        //             ctx.body = { 'message': '更新成功', 'success': true };
        //         }
        //     } else {
        //         ctx.body = { 'message': '更新失败', 'success': false };
        //     }
        // } else {
        //     ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        // }
    }
}

module.exports = GoodsTypeController;
