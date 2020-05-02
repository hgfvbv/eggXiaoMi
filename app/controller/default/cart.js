'use strict';

const BaseController = require('./base');

class CartController extends BaseController {
    async cart() {
        const { ctx, service } = this;

        let cartList = service.cookies.get('cartList'),
            allPrice = 0,
            checkedCount = 0,
            isData = false;

        if (!cartList || cartList.length <= 0) {
            //判断用户是否登录
            let user = await this.isLogin();
            if (user) {
                cartList = await ctx.model.Cart.find({ userId: user._id });
                isData = true;
            }
        }

        for (let i = 0; i < cartList.length; i++) {
            const element = cartList[i];
            if (element.checked) {
                checkedCount++;
                allPrice += element.num * element.price;
            }
        }

        await ctx.render('/default/cart.htm', {
            isData,
            cartList,
            allPrice: allPrice.toFixed(2),
            checkedCount,
            cartCount: cartList.length
        });
    }

    async addCart() {
        const { ctx, service } = this;
        let params = ctx.query,
            goodsId = params.goodsId ? params.goodsId : '',
            colorId = params.colorId ? params.colorId : '';

        if (goodsId == '' || colorId == '') {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        let goods = await ctx.model.Goods.findOne({ _id: goodsId, status: 1 }, '_id title shop_price goods_version goods_img goods_gift'),
            goodsColor = await ctx.model.GoodsColor.findOne({ _id: colorId, status: 1 }, 'color_name');

        if (!goods || !goodsColor) {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        let goodsGiftIds = service.goods.strToArray(goods.goods_gift),   //转换为可以为数据库操作的参数
            goodsGift = await ctx.model.Goods.find({ $or: goodsGiftIds, status: 1 }, '_id title shop_price goods_version goods_img goods_gift').sort({ sort: 1 });

        let currentData = {
            _id: goods._id,
            title: goods.title,
            price: goods.shop_price,
            goods_version: goods.goods_version,
            num: 1,
            color: goodsColor.color_name,
            goods_img: goods.goods_img,
            goods_gift: goodsGift,  /*赠品*/
            goodsGiftIds: goods.goods_gift.replace('，', ',').split(','),   //用于购物车数据库存储
            checked: true           /*默认选中*/
        };

        let user = await this.isLogin();
        if (user) {
            //向数据库中添加
            let cartList = await ctx.model.Cart.find({ userId: user._id }, 'goodsId color');
            if (service.cart.cartHasData(cartList, currentData, true)) {
                let dataNum = (await ctx.model.Cart.findOne({ goodsId: currentData._id, color: currentData.color }, 'num')).num;
                let num = dataNum + currentData.num;
                let uRes = await ctx.model.Cart.updateOne({ goodsId: currentData._id, color: currentData.color }, { num });
                if (uRes.ok <= 0) {
                    console.log('同步购物车更改数量时失败！');
                    await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
                    return;
                }
            } else {
                let cart = new ctx.model.Cart({
                    userId: user._id,
                    goodsId: currentData._id,
                    title: currentData.title,
                    price: currentData.price,
                    goods_version: currentData.goods_version,
                    num: currentData.num,
                    color: currentData.color,
                    goods_img: currentData.goods_img,
                    goodsGiftIds: currentData.goodsGiftIds,
                    checked: currentData.checked
                });

                try {
                    await cart.save();
                } catch (e) {
                    console.log('购物车数据添加到购物车失败！');
                    await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
                    return;
                }
            }
        } else {
            //向cookie中添加
            let cartList = service.cookies.get('cartList');
            if (cartList && cartList.length > 0) {
                if (service.cart.cartHasData(cartList, currentData)) {
                    for (let i = 0; i < cartList.length; i++) {
                        const element = cartList[i];
                        if (element._id == currentData._id && element.color == currentData.color) {
                            cartList[i].price = goods.shop_price;
                            cartList[i].num++;
                        }
                    }
                    service.cookies.set('cartList', cartList);
                } else {
                    let tempArr = cartList;
                    tempArr.push(currentData);
                    service.cookies.set('cartList', tempArr);
                }
            } else {
                let tempArr = [currentData];
                service.cookies.set('cartList', tempArr);
            }
        }

        await ctx.redirect(`/addCartSuccess?goodsId=${goodsId}&colorId=${colorId}`);
    }

    async addCartSuccess() {
        const { ctx } = this;
        let params = ctx.query,
            goodsId = params.goodsId ? params.goodsId : '',
            colorId = params.colorId ? params.colorId : '';

        if (goodsId == '' || colorId == '') {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        let goods = await ctx.model.Goods.findOne({ _id: goodsId, status: 1 }, 'title goods_version'),
            goodsColor = await ctx.model.GoodsColor.findOne({ _id: colorId, status: 1 }, 'color_name');

        if (!goods || !goodsColor) {
            await this.error('/', '哎呀！网页开小差了！要不稍后再试试？');
            return;
        }

        let title = `${goods.title}  ${goods.goods_version}  ${goodsColor.color_name}`;
        await ctx.render('default/add_cart_success.htm', { title, goodsId })
    }

    async changeAllCart() {
        const { ctx, service } = this;
        let params = ctx.query,
            type = params.type ? params.type : '';

        if (type == '') {
            return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
        }

        let user = await this.isLogin(),
            cartList = [],
            allPrice = 0,
            checkedCount = 0;
        if (user) {
            cartList = await ctx.model.Cart.find({ userId: user._id }, 'checked num price');

            if (!cartList || cartList.length == 0) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            let checked = type == 1 ? true : false;
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                cartList[i].checked = checked;
                if (cartList[i].checked) {
                    checkedCount++;
                    allPrice += element.num * element.price;
                }
            }

            let uRes = await ctx.model.Cart.updateMany({ userId: user._id }, { checked });
            if (uRes.ok <= 0) {
                console.log('同步购物车更改状态时失败！');
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }
        } else {
            cartList = service.cookies.get('cartList');

            if (!cartList || cartList.length == 0) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            let checked = type == 1 ? true : false;
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                cartList[i].checked = checked;
                if (cartList[i].checked) {
                    checkedCount++;
                    allPrice += element.num * element.price;
                }
            }

            service.cookies.set('cartList', cartList);
        }

        return ctx.body = {
            success: true,
            allPrice: allPrice.toFixed(2),
            checkedCount,
            cartCount: cartList.length
        };
    }

    async changeOneCart() {
        const { ctx, service } = this;
        let params = ctx.query,
            goodsId = params.goodsId ? params.goodsId : '',
            color = params.color ? params.color : '';

        if (goodsId == '' || color == '') {
            return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
        }

        let goods = await ctx.model.Goods.find({ _id: goodsId, status: 1 }, '_id');
        let cartList = [],
            allPrice = 0,
            checkedCount = 0;

        let user = await this.isLogin();
        if (user) {
            cartList = await ctx.model.Cart.find({ userId: user._id }, 'goodsId color checked num price');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element.goodsId == goodsId && element.color == color) {
                    cartList[i].checked = !cartList[i].checked;
                    let uRes = await ctx.model.Cart.updateOne({ userId: user._id, goodsId, color }, { checked: cartList[i].checked });
                    if (uRes.ok <= 0) {
                        console.log('同步购物车更改状态时失败！');
                        return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
                    }
                }
                if (cartList[i].checked) {
                    checkedCount++;
                    allPrice += element.num * element.price;
                }
            }
        } else {
            cartList = service.cookies.get('cartList');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element._id == goodsId && element.color == color) {
                    cartList[i].checked = !cartList[i].checked;
                }
                if (cartList[i].checked) {
                    checkedCount++;
                    allPrice += element.num * element.price;
                }
            }

            service.cookies.set('cartList', cartList);
        }

        return ctx.body = {
            success: true,
            allPrice: allPrice.toFixed(2),
            checkedCount,
            cartCount: cartList.length
        };
    }

    async decCart() {
        const { ctx, service } = this;
        let params = ctx.query,
            goodsId = params.goodsId ? params.goodsId : '',
            color = params.color ? params.color : '';

        if (goodsId == '' || color == '') {
            return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
        }

        let goods = await ctx.model.Goods.find({ _id: goodsId, status: 1 }, '_id');
        let cartList = [],
            allPrice = 0,
            num = 0,
            totalPrice = 0;

        let user = await this.isLogin();
        if (user) {
            cartList = await ctx.model.Cart.find({ userId: user._id }, 'goodsId color checked num price');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element.goodsId == goodsId && element.color == color) {
                    if (element.num > 1) {
                        cartList[i].num--;
                        num = cartList[i].num;
                        totalPrice = num * element.price;
                    } else {
                        num = element.num;
                        totalPrice = num * element.price;
                    }

                    let uRes = await ctx.model.Cart.updateOne({ userId: user._id, goodsId, color }, { num });
                    if (uRes.ok <= 0) {
                        console.log('同步购物车更改数量时失败！');
                        return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
                    }
                }
                if (cartList[i].checked) {
                    allPrice += cartList[i].num * element.price;
                }
            }
        } else {
            cartList = service.cookies.get('cartList');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element._id == goodsId && element.color == color) {
                    if (element.num > 1) {
                        cartList[i].num--;
                        num = cartList[i].num;
                        totalPrice = num * element.price;
                    } else {
                        num = element.num;
                        totalPrice = num * element.price;
                    }
                }
                if (cartList[i].checked) {
                    allPrice += cartList[i].num * element.price;
                }
            }

            service.cookies.set('cartList', cartList);
        }

        return ctx.body = {
            success: true,
            allPrice: allPrice.toFixed(2),
            num,
            totalPrice: totalPrice.toFixed(2)
        };
    }

    async incCart() {
        const { ctx, service } = this;
        let params = ctx.query,
            goodsId = params.goodsId ? params.goodsId : '',
            color = params.color ? params.color : '';

        if (goodsId == '' || color == '') {
            return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
        }

        let goods = await ctx.model.Goods.find({ _id: goodsId, status: 1 }, '_id');
        let cartList = [],
            allPrice = 0,
            num = 0,
            totalPrice = 0;

        let user = await this.isLogin();
        if (user) {
            cartList = await ctx.model.Cart.find({ userId: user._id }, 'goodsId color checked num price');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element.goodsId == goodsId && element.color == color) {
                    cartList[i].num++;
                    num = cartList[i].num;
                    totalPrice = num * element.price;

                    let uRes = await ctx.model.Cart.updateOne({ userId: user._id, goodsId, color }, { num });
                    if (uRes.ok <= 0) {
                        console.log('同步购物车更改数量时失败！');
                        return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
                    }
                }
                if (cartList[i].checked) {
                    allPrice += cartList[i].num * element.price;
                }
            }
        } else {
            cartList = service.cookies.get('cartList');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.body = { success: false, allPrice: 0, msg: '哎呀！网页开小差了！要不，稍后再试试？' };
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element._id == goodsId && element.color == color) {
                    cartList[i].num++;
                    num = cartList[i].num;
                    totalPrice = num * element.price;
                }
                if (cartList[i].checked) {
                    allPrice += cartList[i].num * element.price;
                }
            }

            service.cookies.set('cartList', cartList);
        }

        return ctx.body = {
            success: true,
            allPrice: allPrice.toFixed(2),
            num,
            totalPrice: totalPrice.toFixed(2)
        };
    }

    async removeCart() {
        const { ctx, service } = this;
        let params = ctx.query,
            goodsId = params.goodsId ? params.goodsId : '',
            color = params.color ? params.color : '';

        if (goodsId == '' || color == '') {
            return ctx.redirect('/cart');
        }

        let goods = await ctx.model.Goods.find({ _id: goodsId, status: 1 }, '_id');
        let cartList = [];

        let user = await this.isLogin();
        if (user) {
            cartList = await ctx.model.Cart.find({ userId: user._id }, 'goodsId color');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.redirect('/cart');
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element.goodsId == goodsId && element.color == color) {
                    let dRes = await ctx.model.Cart.deleteOne({ userId: user._id, goodsId, color });
                    if (dRes.ok <= 0) {
                        console.log('删除购物车数据时失败！');
                        await this.error('/cart', '哎呀！网页开小差了！要不稍后再试试？');
                        return;
                    }
                }
            }
        } else {
            cartList = service.cookies.get('cartList');

            if (!cartList || cartList.length == 0 || !goods) {
                return ctx.redirect('/cart');
            }

            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element._id == goodsId && element.color == color) {
                    cartList.splice(i, 1);
                }
            }

            service.cookies.set('cartList', cartList);
        }

        return ctx.redirect('/cart');
    }

    async isLogin() {
        const { ctx } = this;
        let userInfo = ctx.service.cookies.get('userInfo');

        if (userInfo && userInfo._id && userInfo.phone) {
            //判断数据库里面有没有当前用户                
            let user = await ctx.model.User.findOne({ "_id": userInfo._id, "phone": userInfo.phone, status: 1 });
            return user;
        } else {
            return undefined;
        }
    }
}

module.exports = CartController;
