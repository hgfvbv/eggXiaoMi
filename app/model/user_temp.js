module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const UserTempSchema = new Schema({
        phone: { type: String },
        send_count: { type: Number },
        sign: { type: String },
        add_day: {
            type: String
        },
        ip: { type: String },
        add_time: {
            type: Number
        }
    });

    return mongoose.model('UserTemp', UserTempSchema, 'user_temp');
}