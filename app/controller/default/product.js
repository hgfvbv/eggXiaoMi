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
            goods = await ctx.model.Goods.find({ $or: cateIdArray, status: 1 }, '_id title price sub_title goods_img shop_price').sort({ sort: 1 });
        } else {
            goods = await ctx.model.Goods.find({ status: 1, cate_id: app.mongoose.Types.ObjectId(_id) }, '_id title price sub_title goods_img shop_price').sort({ sort: 1 });
        }

        let url = (goodsCate.template && goodsCate.template != '') ? goodsCate.template : '/default/product_list.htm';
        await ctx.render(url, { goods, title: goodsCate.title });
    }

    async info() {
        const { ctx } = this;
        let params = ctx.query,
            _id = params.id ? params.id : '',
            oneGoods = {};

        if (_id == '') {
            oneGoods = await ctx.model.Goods.findOne({ status: 1 });
        } else {
            oneGoods = await ctx.model.Goods.findOne({ _id, status: 1 });
        }

        let relationIds = ctx.service.goods.strToArray(oneGoods.relation_goods);
        let relationGoods = await ctx.model.Goods.find({ $or: relationIds, status: 1 }, 'goods_version shop_price');

        let colorIds = ctx.service.goods.strToArray(oneGoods.goods_color, true);
        let goodsColors = await ctx.model.GoodsColor.find({ $or: colorIds, status: 1 }, 'color_name color_value');

        let giftIds = ctx.service.goods.strToArray(oneGoods.goods_gift);
        let goodsGifts = await ctx.model.Goods.find({ $or: giftIds, status: 1 }, 'goods_version shop_price');

        let fittingIds = ctx.service.goods.strToArray(oneGoods.goods_fitting);
        let goodsFittings = await ctx.model.Goods.find({ $or: fittingIds, status: 1 }, 'goods_version shop_price');

        let goodsImages = await ctx.model.GoodsImage.find({ goods_id: _id, status: 1 }).limit(8);

        let goodsAttr = await ctx.model.GoodsAttr.find({ goods_id: _id, status: 1 });

        //8、获取更多参数  循环商品属性

        /*
    
          颜色:红色,白色,黄色 |  尺寸:41,42,43
    
            [ 
              
              { cate: '颜色', list: [ '红色', '白色', '黄色 ' ] },
              { cate: ' 尺寸', list: [ '41', '42', '43' ] } 
          
            ]
    
    
          算法：
    
            var goodsAttr='颜色红色,白色,黄色 | 尺寸a41,42,43';
          
            if(goodsAttr&& goodsAttr.indexOf(':')!=-1){    
                goodsAttr=goodsAttr.replace(/，/g,',');
                goodsAttr=goodsAttr.replace(/：/g,':');            
                goodsAttr= goodsAttr.split('|');
                for( var i=0;i<goodsAttr.length;i++){                
                    if(goodsAttr[i].indexOf(':')!=-1){
                        goodsAttr[i]={
                            cate:goodsAttr[i].split(':')[0],
                            list:goodsAttr[i].split(':')[1].split(',')
                        };
                    }else{
                        goodsAttr[i]={}
                    }
                }
    
            }else{
              goodsAttr=[]
              
            }
            console.log(goodsAttr);
    
        */

        await ctx.render('/default/product_info.htm', { oneGoods, relationGoods, goodsColors, goodsGifts, goodsFittings, goodsImages, goodsAttr });
    }

    //根据 颜色以及商品id获取商品图片信息
    async getImagelist() {
        const { ctx, app } = this;
        try {
            let params = ctx.query,
                goods_id = params.goodsId,
                color_id = app.mongoose.Types.ObjectId(params.colorId);

            let goodsImages = await ctx.model.GoodsImage.find({ goods_id, color_id, status: 1 }).limit(8);
            if (goodsImages.length == 0) {
                goodsImages = await ctx.model.GoodsImage.find({ goods_id, status: 1 }).limit(8);
            }
            return ctx.body = { success: true, result: goodsImages };
        } catch (e) {
            console.log(e);
            return ctx.body = { success: false, result: [] };
        }
    }
}

module.exports = ProductController;
