'use strict';

const BaseController = require('./base');

class UserController extends BaseController {
    async welcome() {
        const { ctx, service } = this;
        const userInfo = service.cookies.get('userInfo') || '';
        const uid = userInfo._id || '';

        if (userInfo === '' || uid === '') {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        const waitPayCount = await ctx.model.Order.find({ uid, order_status: 0, pay_status: 0 }).countDocuments();
        const waitShouHuoCount = await ctx.model.Order.find({ uid, order_status: 3, pay_status: 1 }).countDocuments();

        const hour = new Date().getHours();
        let hello = '';
        if (hour < 6) { hello = "凌晨好！"; }
        else if (hour < 9) { hello = "早上好！"; }
        else if (hour < 12) { hello = "上午好！"; }
        else if (hour < 14) { hello = "中午好！"; }
        else if (hour < 17) { hello = "下午好！"; }
        else if (hour < 19) { hello = "傍晚好！"; }
        else if (hour < 22) { hello = "晚上好！"; }
        else { hello = "夜晚好！"; }

        await ctx.render('default/user/welcome.htm', { userInfo, hello, waitPayCount, waitShouHuoCount });
    }

    async order() {
        const { ctx, app, service, config } = this;
        const params = ctx.request.query;
        const uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';
        const page = params.page || 1;
        let json = { uid: app.mongoose.Types.ObjectId(uid) };
        const pageSize = config.orderPageSize || 2;
        const order_status = params.order_status || -1;
        const keywords = params.keywords || '';

        if (uid === '') {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        if (order_status != -1) {
            json = Object.assign(json, { "order_status": parseInt(order_status) });
        }

        if (keywords && keywords !== '') {
            const orderItemJson = Object.assign({ "uid": app.mongoose.Types.ObjectId(uid) }, { "product_title": { $regex: new RegExp(keywords) } });

            const orderItemResult = await ctx.model.OrderItem.find(orderItemJson);

            if (orderItemResult.length > 0) {

                var tempArr = [];
                orderItemResult.forEach(val => {
                    tempArr.push({
                        _id: val.order_id
                    });
                });

                json = Object.assign(json, {
                    $or: tempArr
                });
            } else {
                json = Object.assign(json, {
                    $or: [{ 1: -1 }]
                });
            }
        }

        const totalNum = await ctx.model.Order.find(json).countDocuments();
        const result = await ctx.model.Order.aggregate([
            {
                $lookup: {
                    from: 'order_item',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderItems',
                },
            },
            {
                $sort: { "add_time": -1 }
            },
            {
                $match: json
            },
            {
                $skip: (page - 1) * pageSize,
            },
            {
                $limit: pageSize,
            }
        ]);

        await ctx.render('default/user/order.htm', {
            list: result,
            totalPages: Math.ceil(totalNum / pageSize),
            page,
            order_status,
            keywords
        });
    }

    async orderinfo() {
        const { ctx, service } = this;
        const uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';
        const _id = ctx.request.query.id;

        if (uid === '') {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        let orderResult = await ctx.model.Order.findOne({ uid, _id });
        orderResult = JSON.parse(JSON.stringify(orderResult));
        orderResult.orderItems = await ctx.model.OrderItem.find({ "order_id": _id });

        await ctx.render('default/user/order_info.htm', {
            orderInfo: orderResult
        });
    }
}

module.exports = UserController;
