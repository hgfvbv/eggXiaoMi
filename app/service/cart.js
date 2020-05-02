'use strict';

const Service = require('egg').Service;

class CartService extends Service {
    cartHasData(cartList, currentCart, isData = false) {
        if (cartList && cartList.length > 0) {
            if (isData) {
                for (let i = 0; i < cartList.length; i++) {
                    const element = cartList[i];
                    if (element.goodsId.toString() === currentCart._id.toString() && element.color === currentCart.color) {
                        return true;
                    }
                }
                return false;
            } else {
                for (let i = 0; i < cartList.length; i++) {
                    const element = cartList[i];
                    if (element._id.toString() === currentCart._id.toString() && element.color === currentCart.color) {
                        return true;
                    }
                }
                return false;
            }
        }
        return false;
    }
}

module.exports = CartService;
