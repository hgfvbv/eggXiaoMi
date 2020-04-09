'use strict';

const Service = require('egg').Service;

class GoodsService extends Service {
    /*
        根据商品分类获取推荐商品
        @param {String} cate_id - 分类id
        @param {String} type -  hot  best  new
        @param {Number} limit -  数量
    */
    async get_category_recommend_goods(cate_id, type, limit = 8) {
        const { ctx, app } = this;
        try {
            let cateIds = await ctx.model.GoodsCate.find({ pid: app.mongoose.Types.ObjectId(cate_id), status: 1 }, { _id: 1 });
            if (cateIds.length == 0) {
                cateIds = [{ _id: cate_id }];
            }
            let cateIdArray = [];
            cateIds.forEach(cateId => {
                cateIdArray.push({ 'cate_id': cateId });
            });

            let params = {
                $or: cateIdArray,
                status: 1
            };

            switch (type) {
                case 'hot':
                    params = Object.assign(params, { is_hot: 1 });
                    break;
                case 'best':
                    params = Object.assign(params, { "is_best": 1 });
                    break;
                case 'new':
                    params = Object.assign(params, { "is_new": 1 });
                    break;
            };
            
            let goods = await ctx.model.Goods.find(params, 'title shop_price goods_img sub_title').sort({ sort: 1 }).limit(limit);
            return goods;
        } catch (e) {
            console.log(e);
            return [];
        }
    }
}

module.exports = GoodsService;
