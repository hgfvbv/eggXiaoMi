'use strict';

const BaseController = require('./base');

class BuyController extends BaseController {
    async checkout() {
        const { ctx, service } = this;
        let orderList = [],
            allPrice = 0,
            count = 0,
            cartList = await ctx.model.Cart.find({ userId: service.cookies.get('userInfo')._id }),
            orderSign = await service.tools.md5(await service.tools.getRandomNum(6));

        //用于验证是否重复提交订单的签名
        ctx.session.orderSign = orderSign;

        if (cartList && cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element.checked) {
                    count++;
                    orderList.push(element);
                    allPrice += element.price * element.num;
                }
            }

            // 获取当前用户的所有收货地址
            const uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';
            const addressList = await this.ctx.model.Address.find({ uid }, '_id name phone address zipcode default_address').sort({ default_address: -1 });

            await ctx.render('default/checkout.htm', { orderList, allPrice, count, addressList, orderSign });
        } else {
            ctx.redirect('/cart');
        }
    }

    async doOrder() {
        const { ctx, service } = this;
        let params = ctx.request.body,
            orderSign = params.orderSign.trim() || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (orderSign === '' || uid === '') {
            ctx.session.orderSign = null;
            await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        if (orderSign !== ctx.session.orderSign) {
            ctx.session.orderSign = null;
            await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }
        ctx.session.orderSign = null;

        let addressResult = await ctx.model.Address.findOne({ uid, default_address: 1 }, 'name phone address zipcode');
        let cartList = await ctx.model.Cart.find({ userId: uid, checked: 1 }, '_id title color goodsId goods_img price num');
        let add_time = await service.tools.getTime();

        if (addressResult && cartList && cartList.length > 0) {
            let all_price = 0;
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                all_price += element.price * element.num;
            }

            // 注意：订单表和订单详情表的order_id有区别，订单表的order_id是给用户看的，订单详情表的order_id是用来关联订单表的主键_id的
            let order = new ctx.model.Order({
                uid,
                all_price,
                order_id: await service.tools.getOrderId(),
                name: addressResult.name,
                phone: addressResult.phone,
                address: addressResult.address,
                zipcode: addressResult.zipcode,
                pay_status: 0,   // 支付状态： 0 表示未支付     1 已经支付
                pay_type: '',      // 支付类型： alipay    wechat  
                order_status: 0,
                add_time
            });

            order = await order.save();

            if (order && order._id) {
                let insertArray = [];
                // 注意：订单表和订单详情表的order_id有区别，订单表的order_id是给用户看的，订单详情表的order_id是用来关联订单表的主键_id的
                for (let i = 0; i < cartList.length; i++) {
                    const element = cartList[i];
                    insertArray.push(new ctx.model.OrderItem({
                        uid,
                        order_id: order._id,
                        product_title: element.title,
                        product_color: element.color,
                        product_id: element.goodsId,
                        product_img: element.goods_img,
                        product_price: element.price,
                        product_num: element.num,
                        add_time
                    }));
                }

                let res = await ctx.model.OrderItem.insertMany(insertArray);
                if (res.length > 0) {
                    await ctx.model.Cart.deleteMany({ userId: uid, checked: 1 });
                    ctx.redirect(`/buy/confirm?id=${order._id}`);
                } else {
                    await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
                    return;
                }
            } else {
                await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
                return;
            }
        } else {
            await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }
    }

    async confirm() {
        const { ctx, service } = this;
        let params = ctx.query,
            _id = params.id.trim() || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (_id === '' || uid === '') {
            await this.error('/buy/checkout', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }
        let orderResult = await ctx.model.Order.findOne({ _id, uid }, '_id all_price order_id name phone address');
        if (orderResult) {
            let orderItemResult = await ctx.model.OrderItem.find({ order_id: _id }, 'product_title product_color product_num');

            await this.ctx.render('default/confirm.htm', {
                orderResult,
                orderItemResult
            });
        } else {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
        }
    }

    //执行多次 查询订单是否更新
    async  getOrderPayStatus() {
        const { ctx, service } = this;
        const _id = ctx.query.id || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (_id === '' || uid === '') {
            ctx.body = {
                success: false,
                message: '未支付'
            };
            return;
        }

        try {
            let orderResult = await ctx.model.Order.findOne({ _id, uid }, 'pay_status order_status');
            if (orderResult && orderResult.pay_status === 1 && orderResult.order_status === 1) {
                ctx.body = {
                    success: true,
                    message: '已支付'
                };
            } else {
                ctx.body = {
                    success: false,
                    message: '未支付'
                };
            }
        } catch (e) {
            console.log(e);
            ctx.body = {
                success: false,
                message: '未支付'
            };
        }
    }
}

module.exports = BuyController;
