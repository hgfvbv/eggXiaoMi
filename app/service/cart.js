'use strict';

const Service = require('egg').Service;

class CartService extends Service {
    cartHasData(cartList, currentCart) {
        if (cartList && cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                if (element._id == currentCart._id && element.color == currentCart.color) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }
}

module.exports = CartService;
