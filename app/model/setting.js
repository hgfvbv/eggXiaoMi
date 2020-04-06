module.exports = app => {
  const mongoose = app.mongoose,
    Schema = mongoose.Schema;

  const SettingSchema = new Schema({
    site_title: { type: String },
    site_ico: { type: String },
    site_logo: { type: String },
    site_keywords: {
      type: String
    },
    site_description: {
      type: String
    },
    site_address: {
      type: String
    },
    site_policeIcp: {
      type: String
    },
    no_picture: {
      type: String
    },
    site_icp: {
      type: String
    },
    site_qq: {
      type: String
    },
    site_status: {
      type: Number
    },
    site_tel: {
      type: String
    },
    search_keywords: {
      type: String
    },
    tongji_code: {
      type: String
    },
    edit_time: {
      type: Number
    }
  });

  return mongoose.model('Setting', SettingSchema, 'setting');
}