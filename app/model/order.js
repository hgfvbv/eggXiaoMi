module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const Order = new Schema({
        uid: { type: Schema.Types.ObjectId },
        all_price: { type: Number },
        order_id: { type: String },
        name: { type: String },
        phone: { type: String },
        address: { type: String },
        zipcode: { type: String },
        pay_status: { type: Number },   // 支付状态： 0 表示未支付     1 已经支付
        pay_type: { type: String },      // 支付类型： alipay    wechat  
        order_status: {               // 订单状态： 0 已下单  1 已付款  2 已配货  3、发货   4、交易成功   5、退货     6、取消      
            type: Number
        },
        add_time: {
            type: Number
        }
    });

    return mongoose.model('Order', Order, 'order');
};
