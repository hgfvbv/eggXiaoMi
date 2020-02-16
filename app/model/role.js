module.exports = app => {
    const mongoose = app.mongoose,
        Schema = mongoose.Schema;

    let d = new Date();
    const RoleScheam = new Schema({
        title: { type: String },
        description: { type: String },
        status: { type: Number, default: 1 },
        add_time: {
            type: Number,
            default: d.getTime()
        },
        edit_time: {
            type: Number,
            default: d.getTime()
        }
    });

    return mongoose.model('Role', RoleScheam, 'role');
}