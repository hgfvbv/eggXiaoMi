module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const CartSchema = new Schema({
        userId: { type: Schema.Types.ObjectId },
        goodsId: { type: Schema.Types.ObjectId },
        title: { type: String },
        price: { type: Number },
        goods_version: { type: String },
        num: { type: Number },
        color: { type: String },
        goods_img: { type: String },
        goodsGiftIds: {
            type: [String]
        },
        checked: { type: Boolean }
    });

    return mongoose.model('Cart', CartSchema, 'cart');
}