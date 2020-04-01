'use strict';

const BaseController = require('./base');

class GoodsTypeAttributesController extends BaseController {
    async index() {
        const { ctx, app } = this;

        let params = ctx.query,
            cate_id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            where = '';

        if (cate_id == '') {
            await this.error('/admin/goodsType', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (title && title != '') {
            //模糊查询
            where = title;
        };

        let goodsTypeTitle = (await ctx.model.GoodsType.findOne({ "_id": cate_id }, { title: 1 })).title;

        let list = await ctx.model.GoodsTypeAttribute.aggregate([
            {
                $lookup: {
                    from: 'goods_type',
                    localField: 'cate_id',
                    foreignField: '_id',
                    as: 'goods_type'
                }
            },
            {
                $match: {
                    $and: [
                        { cate_id: app.mongoose.Types.ObjectId(cate_id) },
                        { title: { $regex: where } }
                    ]
                }
            },
            {
                $sort: {
                    sort: 1
                }
            }
        ]);
        await this.ctx.render('/admin/goodsTypeAttribute/index', { params, goodsTypeTitle, list });
    }

    async add() {
        const { ctx } = this;

        let params = ctx.query,
            cate_id = params.id ? params.id.trim() : '';

        if (cate_id == '') {
            await this.error('/admin/goodsType', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let goodsType = await ctx.model.GoodsType.find({ status: 1 }, { title: 1 });

        await this.ctx.render('admin/goodsTypeAttribute/add', { cate_id, goodsType });
    }

    async doAdd() {
        const { ctx } = this;
        let params = ctx.request.body,
            title = params.title ? params.title.trim() : '',
            cate_id = params.cate_id ? params.cate_id.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            attr_type = params.attr_type,
            attr_value = params.attr_value ? params.attr_value.trim() : '';

        if (title == '' || cate_id == '' || sort == '' || !(/^\d+$/.test(sort)) || (attr_type == 3 && attr_value == '')) {
            await this.error(`/admin/goodsTypeAttribute/add?id=${cate_id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let goodsTypeAttribute = new ctx.model.GoodsTypeAttribute({
            title,
            cate_id,
            sort,
            attr_type,
            attr_value,
            status: params.status ? 1 : 0,
            add_time: await ctx.service.tools.getTime()
        });

        try {
            goodsTypeAttribute = await goodsTypeAttribute.save();
            await ctx.redirect(`/admin/goodsTypeAttribute?id=${cate_id}`);
        } catch (err) {
            await this.error(`/admin/goodsTypeAttribute/add?id=${cate_id}`, '增加商品类型属性失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            cate_id = params.cate_id ? params.cate_id.trim() : '',
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '' || cate_id == '') {
            await this.error(`/admin/goodsTypeAttribute?id=${cate_id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let goodsType = await ctx.model.GoodsType.find({ status: 1 }, { title: 1 });
        let result = await ctx.model.GoodsTypeAttribute.find(where);
        await this.ctx.render('admin/goodsTypeAttribute/edit', { result: result[0], goodsType, cate_id });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            oldCate = params.oldCate ? params.oldCate.trim() : '',
            cate_id = params.cate_id ? params.cate_id.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            attr_type = params.attr_type,
            attr_value = params.attr_value ? params.attr_value.trim() : '',
            where = {},
            uParams = {};

        if (id == '') {
            if (oldCate == '') {
                await this.error('/admin/goodsType', '对不起！服务器繁忙！要不稍后再试试？');
                return;
            };
            await this.error(`/admin/goodsTypeAttribute?id=${oldCate}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (title == '' || cate_id == '' || sort == '' || !(/^\d+$/.test(sort)) || (attr_type == 3 && attr_value == '')) {
            await this.error(`/admin/goodsTypeAttribute/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            title,
            cate_id,
            sort,
            attr_type,
            attr_value,
            status: params.status ? 1 : 0
        };

        let goodsTypeAttribute = await ctx.model.GoodsTypeAttribute.updateOne(where, uParams);

        if (goodsTypeAttribute.ok > 0) {
            let goodsAttrParams = {
                attribute_type: uParams.attr_type,
                attribute_title: uParams.title,
                status: uParams.status
            };
            if (attr_value != '') {
                let attribute_value = uParams.attr_value.split('\n')[0];
                goodsAttrParams = {
                    attribute_type: uParams.attr_type,
                    attribute_title: uParams.title,
                    attribute_value,
                    status: uParams.status
                };
            }
            try {
                await ctx.model.GoodsAttr.updateMany({ attribute_id: id }, goodsAttrParams);
                if (!uParams.status) {
                    let goodsTypeAttrStatusCount = await ctx.model.GoodsTypeAttribute.find({ cate_id: uParams.cate_id, status: 1 }).count();
                    if (!goodsTypeAttrStatusCount) {
                        await ctx.model.GoodsType.updateOne({ _id: uParams.cate_id }, { status: uParams.status });
                    }
                }
                await ctx.redirect(`/admin/goodsTypeAttribute?id=${cate_id}`);
            } catch (err) {
                console.log(err);
                await this.error(`/admin/goodsTypeAttribute/edit?id=${id}`, '编辑商品类型失败！');
            }
        } else {
            await this.error(`/admin/goodsTypeAttribute/edit?id=${id}`, '编辑商品类型失败！');
        }
    }

    async changeStatus() {
        const { ctx } = this;
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

        let goodsTypeAttr = await ctx.model.GoodsTypeAttribute.findOne(where, { status: 1, cate_id: 1 });
        let goodsTypeAttrStatus = goodsTypeAttr.status,
            goodsTypeAttrCateId = goodsTypeAttr.cate_id;
        if (goodsTypeAttrStatus == undefined) {
            ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        } else {
            let uParams = goodsTypeAttrStatus == 0 ? { status: 1 } : { status: 0 };

            try {
                await ctx.model.GoodsTypeAttribute.updateOne(where, uParams);
                if (goodsTypeAttrStatus) {
                    let goodsTypeAttrStatusCount = await ctx.model.GoodsTypeAttribute.find({ cate_id: goodsTypeAttrCateId, status: 1 }).count();
                    if (!goodsTypeAttrStatusCount) {
                        await ctx.model.GoodsType.updateOne({ _id: goodsTypeAttrCateId }, uParams);
                    }
                } else {
                    let goodsTypeStatus = (await ctx.model.GoodsType.findOne({ _id: goodsTypeAttrCateId }, { status: 1, _id: 0 })).status;
                    if (!goodsTypeStatus) {
                        await ctx.model.GoodsType.updateOne({ _id: goodsTypeAttrCateId }, uParams);
                    }
                }
                await ctx.model.GoodsAttr.updateMany({ attribute_id: id, status: goodsTypeAttrStatus }, uParams);
                ctx.body = { 'message': '更新成功', 'success': true };
            } catch (err) {
                console.log(err);
                ctx.body = { 'message': '更新失败', 'success': false };
            }
        }
    }

    async delete() {
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

        try {
            await ctx.model.GoodsTypeAttribute.deleteOne(where);
            await ctx.model.GoodsAttr.deleteMany({ attribute_id: id });
            await ctx.redirect(ctx.state.prevPage);
        } catch (err) {
            console.log(err);
            await this.error(ctx.state.prevPage, '删除商品属性失败！');
        }
    }
}

module.exports = GoodsTypeAttributesController;
