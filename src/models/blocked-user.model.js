const { Schema, model } = require('mongoose');

const blockedUserSchema = new Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = model('blocked-user', blockedUserSchema);