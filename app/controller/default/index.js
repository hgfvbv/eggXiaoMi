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
                    let relationArray = navMiddle[i].relation.split(',');
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

        await ctx.render('/default/index.htm', {
            navTop,
            navFooter,
            navMiddle
        });
    }
}

module.exports = IndexController;
