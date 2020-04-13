'use strict';

const Controller = require('egg').Controller;

class ProductController extends Controller {
    async list() {
        const { ctx, app } = this;
        let params = ctx.query,
            _id = params.cid ? params.cid : '',
            goodsCate = {},
            goods = [];

        if (_id == '') {
            goodsCate = await ctx.model.GoodsCate.findOne({ status: 1 }, 'pid template title');
        } else {
            goodsCate = await ctx.model.GoodsCate.findOne({ _id, status: 1 }, 'pid template title');
        }

        if (goodsCate.pid == '0') {
            let cateIds = await ctx.model.GoodsCate.find({ status: 1, pid: app.mongoose.Types.ObjectId(_id) }, '_id');
            let cateIdArray = [];
            for (let i = 0; i < cateIds.length; i++) {
                cateIdArray.push({ cate_id: cateIds[i]._id });
            }
            goods = await ctx.model.Goods.find({ $or: cateIdArray }, '_id title price sub_title goods_img shop_price').sort({ sort: 1 });
            console.log(cateIdArray)
        } else {
            goods = await ctx.model.Goods.find({ status: 1, cate_id: app.mongoose.Types.ObjectId(_id) }, '_id title price sub_title goods_img shop_price').sort({ sort: 1 });
        }

        let url = (goodsCate.template && goodsCate.template != '') ? goodsCate.template : '/default/product_list.htm';
        await ctx.render(url, { goods, title: goodsCate.title });
    }

    async info() {
        const { ctx } = this;
        await ctx.render('/default/product_info.htm');
    }
}

module.exports = ProductController;
