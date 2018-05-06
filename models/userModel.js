const mongoose = require('mongoose');

const userModel = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    currentBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'books' }],
}, { versionKey: false });

module.exports = mongoose.model('users', userModel);
