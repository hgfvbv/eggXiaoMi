'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index() {
        const { ctx, app } = this;
        let navTop = await ctx.model.Nav.find({ 'status': 1, 'position': 1 }, { title: 1, _id: 0, link: 1, is_opennew: 1, status: 1 }).sort({ sort: 1 });

        let navFooter = await ctx.model.Nav.find({ 'status': 1, 'position': 3 }, { title: 1, _id: 0, link: 1, is_opennew: 1, status: 1 }).sort({ sort: 1 });

        let navMiddle = await ctx.model.Nav.find({ 'status': 1, 'position': 2 }, { title: 1, _id: 0, link: 1, is_opennew: 1, relation: 1, status: 1 }).sort({ sort: 1 });
        //不可拓展属性的对象  解决方法
        navMiddle = JSON.parse(JSON.stringify(navMiddle));
        for (let i = 0; i < navMiddle.length; i++) {
            if (navMiddle[i].relation) {
                try {
                    let goodsIds = [];
                    let relationArray = navMiddle[i].relation.replace('，', ',').split(',');
                    relationArray.forEach(id => {
                        goodsIds.push({ _id: app.mongoose.Types.ObjectId(id) });
                    });
                    let relationGoods = await ctx.model.Goods.find({ status: 1, $or: goodsIds }, { title: 1, _id: 0, goods_img: 1, shop_price: 1 }).sort({ sort: 1 });

                    navMiddle[i].subGoods = relationGoods;
                } catch (e) {
                    console.log(e);
                    navMiddle[i].subGoods = [];
                }
            } else {
                navMiddle[i].subGoods = [];
            }
        }

        let goodsCate = await ctx.model.GoodsCate.aggregate([
            {
                $lookup: {
                    from: 'goods_cate',
                    localField: '_id',
                    foreignField: 'pid',
                    as: 'child'
                }
            },
            {
                $match: {
                    $and: [
                        { status: 1 },
                        { pid: '0' }
                    ]
                }
            },
            {
                $sort: {
                    sort: 1
                }
            },
            {
                $project: {
                    title: 1,
                    link: 1,
                    cate_img: 1,
                    keywords: 1,
                    child: 1
                }
            }
        ]);
        for (let i = 0; i < goodsCate.length; i++) {
            goodsCate[i].child = await ctx.service.tools.jsonSort(goodsCate[i].child, 'sort', false);
            goodsCate[i].child = goodsCate[i].child.slice(0, 8);
        }

        let focus = await ctx.model.Focus.find({ type: 1, status: 1 }, { link: 1, _id: 0, focus_img: 1, title: 1 }).sort({ sort: 1 });

        let phoneGoods = await ctx.service.goods.get_category_recommend_goods('5bbf058f9079450a903cb77b', 'best', 8);

        let tvGoods = await ctx.service.goods.get_category_recommend_goods('5bbf05ac9079450a903cb77c', 'best', 8);

        await ctx.render('/default/index.htm', {
            navTop,
            navFooter,
            navMiddle,
            goodsCate,
            focus,
            phoneGoods,
            tvGoods
        });
    }
}

module.exports = IndexController;
