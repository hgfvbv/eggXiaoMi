'use strict';

const Controller = require('egg').Controller;

class SearchController extends Controller {
    async index() {
        const { ctx, service } = this;

        //增加数据
        // const result = await service.search.create('news', '2567', { title: '测试', content: '使用ARM芯片的Mac将可能在2020年推出666' });

        //修改数据
        // const result = await service.search.update('news', '2567', { title: '测试1', content: '使用ARM芯片的Mac将可能在2020年推出' });

        //删除数据
        // const result = await service.search.delete('news', '2567');

        // 搜索 查询数据
        // const result = await service.search.find('news', { content: '中国' });

        //分页
        //const result = await service.search.find('news', { content: '中国' }, { isPage: true, page: 1, pageSize: 1 });

        //统计总数量
        // const result = await service.search.count('news', { content: '中国' });

        let params = ctx.query,
            content = params.txtVal || '',
            goods = [];

        if (content) {
            const result = await service.search.find('goods', { content });
            result.forEach(item => {
                goods.push({ _id: item.id, goods_img: item.goods_img, title: item.title, sub_title: item.content.split(',')[1], shop_price: item.shop_price });
            });
        }

        await ctx.render('/default/product_list.htm', { goods, title: content || ctx.state.setting.site_title });
    }
}

module.exports = SearchController;
