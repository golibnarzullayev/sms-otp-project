const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    resetId: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

module.exports = model('user', userSchema);