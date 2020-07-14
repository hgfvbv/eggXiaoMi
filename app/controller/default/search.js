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
        const result = await service.search.find('news', { content: '中国' }, { isPage: true, page: 1, pageSize: 1 });

        //统计总数量
        // const result = await service.search.count('news', { content: '中国' });

        ctx.body = result;
    }
}

module.exports = SearchController;
