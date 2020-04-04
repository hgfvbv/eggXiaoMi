module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const ArticleCateSchema = new Schema({
    title: { type: String },
    cate_img: { type: String },
    link: {
      type: String
    },
    pid: {
      type: Schema.Types.Mixed  //混合类型   
    },
    sub_title: { type: String },          /*seo相关的标题  关键词  描述*/
    keywords: { type: String },
    description: { type: String },
    status: { type: Number, default: 1 },
    sort: { type: Number, default: 0 },
    add_time: {
      type: Number
    }

  });

  return mongoose.model('ArticleCate', ArticleCateSchema, 'article_cate');
}