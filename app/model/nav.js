module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const NavSchema = new Schema({
    title: { type: String },
    link: { type: String },
    position: {
      type: Number,
      default: 2    //1最顶部     2中间   3底部 
    },
    is_opennew: {
      type: Number,
      default: 1    //1、本窗口    2、新窗口
    },
    sort: {
      type: Number,
      default: 0
    },
    relation: {     //  1,2,3
      type: String,
      default: ''
    },
    status: { type: Number, default: 1 },
    add_time: {
      type: Number
    }
  });

  return mongoose.model('Nav', NavSchema, 'nav');
}