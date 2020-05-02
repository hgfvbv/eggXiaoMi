module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const BlackListSchema = new Schema({
        phone: { type: String },
        ip: { type: String },
        add_time: {
            type: Number
        }
    });

    return mongoose.model('BlackList', BlackListSchema, 'black_list');
}