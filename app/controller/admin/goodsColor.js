'use strict';

const BaseController = require('./base');

class GoodsColorController extends BaseController {
    async index() {
        const { ctx } = this;

        let params = ctx.query,
            color_name = params.color_name ? params.color_name.trim() : '',
            where = {};

        if (color_name && color_name != '') {
            //模糊查询
            where = {
                $or: [
                    { color_name: { $regex: color_name } }
                ]
            };
        };

        let list = await ctx.model.GoodsColor.find(where);
        await ctx.render('admin/goodsColor/index', { params, list });
    }

    async add() {
        await this.ctx.render('admin/goodsColor/add');
    }

    async doAdd() {
        const { ctx } = this;
        let params = ctx.request.body,
            color_name = params.color_name ? params.color_name.trim() : '',
            color_value = params.color_value ? params.color_value.trim() : '';

        if (color_name == '' || color_value == '') {
            await this.error('/admin/goodsColor/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let goodsColor = new ctx.model.GoodsColor({
            color_name,
            color_value,
            status: params.status ? 1 : 0
        });

        try {
            goodsColor = await goodsColor.save();
            await ctx.redirect('/admin/goodsColor');
        } catch (err) {
            await this.error('/admin/goodsColor/add', '增加商品颜色失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/goodsColor', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.GoodsColor.find(where);
        await this.ctx.render('admin/goodsColor/edit', { result: result[0] });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            color_name = params.color_name ? params.color_name.trim() : '',
            color_value = params.color_value ? params.color_value.trim() : '',
            where = {},
            uParams = {};

        if (id == '') {
            await this.error('/admin/goodsColor', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (color_name == '' || color_value == '') {
            await this.error(`/admin/goodsColor/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            color_name,
            color_value,
            status: params.status ? 1 : 0
        };

        let goodsColor = await ctx.model.GoodsColor.updateOne(where, uParams);

        if (goodsColor.nModified > 0) {
            await ctx.redirect('/admin/goodsColor');
        } else {
            await this.error(`/admin/goodsColor/edit?id=${id}`, '编辑商品颜色失败！');
        }
    }

    async delete() {
        const { ctx, app } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/goodsCate', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        try {
            await ctx.model.GoodsColor.deleteOne(where);
            await ctx.model.GoodsImage.updateMany({ color_id: app.mongoose.Types.ObjectId(id) }, { color_id: '' });
            let goods = await ctx.model.Goods.find({ $or: [{ goods_color: id }] }, { goods_color: 1 });
            for (let i = 0; i < goods.length; i++) {
                goods[i].goods_color = goods[i].goods_color.filter((e => { return e != id }));
                await ctx.model.Goods.updateOne({ _id: goods[i]._id }, { goods_color: goods[i].goods_color });
            }
            await ctx.redirect(ctx.state.prevPage);
        } catch (err) {
            console.log(err);
            await this.error(ctx.state.prevPage, '删除商品颜色失败！');
        }
    }
}

module.exports = GoodsColorController;
