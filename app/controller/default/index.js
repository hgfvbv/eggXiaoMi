'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index() {
        const { ctx, service } = this;

        //清除注册可能没有清空的session
        ctx.session.identify_code = '';
        ctx.session.phone_code = '';

        //清除临时用户表非当天的数据
        let nowDay = await service.tools.getDay();
        await ctx.model.UserTemp.deleteMany({ add_day: { $ne: nowDay } });

        let focus = await service.cache.get('index_focus');
        if (!focus || focus == '') {
            focus = await ctx.model.Focus.find({ type: 1, status: 1 }, { link: 1, _id: 0, focus_img: 1, title: 1 }).sort({ sort: 1 });
            await service.cache.set('index_focus', focus);
        }

        let phoneGoods = await service.cache.get('index_phoneGoods');
        if (!phoneGoods || phoneGoods == '') {
            phoneGoods = await ctx.service.goods.get_category_recommend_goods('5bbf058f9079450a903cb77b', 'best', 8);
            await service.cache.set('index_phoneGoods', phoneGoods);
        }

        let tvGoods = await service.cache.get('index_tvGoods');
        if (!tvGoods || tvGoods == '') {
            tvGoods = await ctx.service.goods.get_category_recommend_goods('5bbf05ac9079450a903cb77c', 'best', 8);
            await service.cache.set('index_tvGoods', tvGoods);
        }

        await ctx.render('/default/index.htm', {
            focus,
            phoneGoods,
            tvGoods
        });
    }
}

module.exports = IndexController;
