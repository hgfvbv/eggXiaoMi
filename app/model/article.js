module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const ArticleSchema = new Schema({
    title: { type: String },
    cate_id: { type: Schema.Types.ObjectId },
    article_img: { type: String },
    link: {
      type: String
    },
    content: { type: String },
    keywords: { type: String },
    description: { type: String },
    sort: { type: Number, default: 0 },
    add_time: {
      type: Number
    },
    status: { type: Number, default: 1 }
  });
  return mongoose.model('Article', ArticleSchema, 'article');
}
