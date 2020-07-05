module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;
    const d = new Date();
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
        },
        pay_time: {
            type: Number,
            default: d.getTime()
        },
        peihuo_time: {
            type: Number,
            default: d.getTime()
        },
        chuku_time: {
            type: Number,
            default: d.getTime()
        },
        success_time: {
            type: Number,
            default: d.getTime()
        },
        wuliuCompany: {
            type: String,
            default: '顺丰(杭州)'
        },
        wuliuHost: {
            type: String,
            default: 'http://www.sf-express.com'
        },
        wuliuNo: {
            type: String,
            default: '199384067236'
        },
    });

    return mongoose.model('Order', Order, 'order');
};
