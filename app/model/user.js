module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const UserSchema = new Schema({
        password: { type: String },
        phone: { type: String },
        last_ip: { type: String },
        add_time: {
            type: Number
        },
        email: {
            type: String,
            default: ""
        },
        status: {
            type: Number
        }
    });

    return mongoose.model('User', UserSchema, 'user');
}