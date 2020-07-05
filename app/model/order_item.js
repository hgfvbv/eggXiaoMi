module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const OrderItem = new Schema({
        uid: { type: Schema.Types.ObjectId },
        order_id: { type: Schema.Types.ObjectId },
        product_title: { type: String },
        product_color: { type: String },
        product_id: { type: Schema.Types.ObjectId },
        product_img: { type: String },
        product_price: { type: Number },
        product_num: { type: Number },
        add_time: {
            type: Number
        }
    });

    return mongoose.model('OrderItem', OrderItem, 'order_item');
};
