module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const GoodsAttrSchema = new Schema({
    goods_id: { type: Schema.Types.ObjectId },
    cate_id: {
      type: Schema.Types.ObjectId
    },
    attribute_id: {
      type: Schema.Types.ObjectId
    },
    attribute_type: {
      type: String
    },
    attribute_title: {
      type: String
    },
    attribute_value: {
      type: String
    },
    status: { type: Number, default: 1 },
    sort: { type: Number, default: 0 },
    add_time: {
      type: Number
    }
  });

  return mongoose.model('GoodsAttr', GoodsAttrSchema, 'goods_attr');
}