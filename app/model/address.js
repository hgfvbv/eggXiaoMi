module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    const AddressSchema = new Schema({
        uid: { type: Schema.Types.ObjectId },
        name: { type: String },
        phone: { type: String },
        address: { type: String },
        zipcode: { type: String },
        default_address: { type: Number, default: 1 },
        add_time: {
            type: Number
        },
    });

    return mongoose.model('Address', AddressSchema, 'address');
};

