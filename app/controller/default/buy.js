'use strict';

const Controller = require('egg').Controller;

class BuyController extends Controller {
    async checkout() {
        const { ctx, service } = this;
        let orderList = [],
            allPrice = 0,
            count = 0,
            cartList = await ctx.model.Cart.find({ userId: ctx.state.userInfo._id });

        if (cartList && cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element.checked) {
                    count++;
                    orderList.push(element);
                    allPrice += element.price * element.num;
                }
            }

            await ctx.render('default/checkout.htm', { orderList, allPrice, count });
        } else {
            ctx.redirect('/cart');
        }
    }
}

module.exports = BuyController;
