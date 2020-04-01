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
        const { ctx, app } = this;
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
            await ctx.model.GoodsTypeAttribute.updateMany({ cate_id: id, status: !uParams.status }, { status: uParams.status });
            let goods = await ctx.model.Goods.find({ goods_type_id: app.mongoose.Types.ObjectId(id) }, { _id: 1 });
            for (let i = 0; i < goods.length; i++) {
                await ctx.model.GoodsAttr.updateMany({ goods_id: goods[i]._id, status: !uParams.status }, { status: uParams.status });
            }
            await ctx.redirect('/admin/goodsType');
        } else {
            await this.error(`/admin/goodsType/edit?id=${id}`, '编辑商品类型失败！');
        }
    }

    async changeStatus() {
        const { ctx, app } = this;
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

        let goodsTypeStatus = (await ctx.model.GoodsType.findOne(where, { status: 1 })).status;
        if (goodsTypeStatus == undefined) {
            ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        } else {
            let uParams = goodsTypeStatus == 0 ? { status: 1 } : { status: 0 };

            try {
                await ctx.model.GoodsType.updateOne(where, uParams);
                await ctx.model.GoodsTypeAttribute.updateMany({ cate_id: id, status: goodsTypeStatus }, uParams);
                let goods = await ctx.model.Goods.find({ goods_type_id: app.mongoose.Types.ObjectId(id) }, { _id: 1 });
                for (let i = 0; i < goods.length; i++) {
                    await ctx.model.GoodsAttr.updateMany({ goods_id: goods[i]._id, status: goodsTypeStatus }, uParams);
                }
                ctx.body = { 'message': '更新成功', 'success': true };
            } catch (err) {
                console.log(err);
                ctx.body = { 'message': '更新失败', 'success': false };
            }
        }
    }

    async delete() {
        const { ctx, app } = this;
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

        try {
            await ctx.model.GoodsType.deleteOne(where);
            await ctx.model.GoodsTypeAttribute.deleteMany({ cate_id: id });
            let goods = await ctx.model.Goods.find({ goods_type_id: app.mongoose.Types.ObjectId(id) }, { _id: 1 });
            await ctx.model.Goods.updateMany({ goods_type_id: app.mongoose.Types.ObjectId(id) }, { goods_type_id: '0' });
            for (let i = 0; i < goods.length; i++) {
                await ctx.model.GoodsAttr.deleteMany({ goods_id: goods[i]._id });
            }
            await ctx.redirect(ctx.state.prevPage);
        } catch (err) {
            console.log(err);
            await this.error(ctx.state.prevPage, '删除商品类型失败！');
        }
    }
}

module.exports = GoodsTypeController;
