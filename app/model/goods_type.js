module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const GoodsTypeSchema = new Schema({
        title: { type: String },
        description: { type: String },
        status: { type: Number, default: 1 },
        add_time: { type: Number }
    });

    return mongoose.model('GoodsType', GoodsTypeSchema, 'goods_type');
}