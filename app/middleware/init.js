module.exports = (options, app) => {
    return async (ctx, next) => {
        const { service } = ctx;
        
        let navTop = await service.cache.get('index_navTop');
        if (!navTop || navTop == '') {
            navTop = await ctx.model.Nav.find({ 'status': 1, 'position': 1 }, { title: 1, _id: 0, link: 1, is_opennew: 1, status: 1 }).sort({ sort: 1 });
            await service.cache.set('index_navTop', navTop);
        }

        let navFooter = await service.cache.get('index_navFooter');
        if (!navFooter || navFooter == '') {
            navFooter = await ctx.model.Nav.find({ 'status': 1, 'position': 3 }, { title: 1, _id: 0, link: 1, is_opennew: 1, status: 1 }).sort({ sort: 1 });
            await service.cache.set('index_navFooter', navFooter);
        }

        let navMiddle = await service.cache.get('index_navMiddle');
        if (!navMiddle || navMiddle == '') {
            navMiddle = await ctx.model.Nav.find({ 'status': 1, 'position': 2 }, { title: 1, _id: 0, link: 1, is_opennew: 1, relation: 1, status: 1 }).sort({ sort: 1 });
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
            await service.cache.set('index_navMiddle', navMiddle);
        }

        let goodsCate = await service.cache.get('index_goodsCate');
        if (!goodsCate || goodsCate == '') {
            goodsCate = await ctx.model.GoodsCate.aggregate([
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
                goodsCate[i].child = goodsCate[i].child.filter((e => { return e.status == 1 }));
                goodsCate[i].child = await ctx.service.tools.jsonSort(goodsCate[i].child, 'sort', false);
                goodsCate[i].child = goodsCate[i].child.slice(0, 8);
            }
            console.log(goodsCate)
            await service.cache.set('index_goodsCate', goodsCate);
        }

        ctx.state.navTop = navTop;
        ctx.state.navFooter = navFooter;
        ctx.state.navMiddle = navMiddle;
        ctx.state.goodsCate = goodsCate;
        await next();
    };
}