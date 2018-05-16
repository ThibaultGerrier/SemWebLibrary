const mongoose = require('mongoose');

const bookModel = new mongoose.Schema({
    name: { type: String },
    alternateName: { type: String },
    subject: [{ type: String }],
    bookshelf: { type: String },
    downloadOptions: [{
        type: { type: String },
        url: { type: String },
    }],
    gutenbergId: { type: String },
    bookings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
    }],
    buys: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
    }],
    totalQuantify: { type: Number },
    availableQuantify: { type: Number },
    price: { type: Number },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'authors' },
    authorGutenbergId: { type: String },
    reviews: [{
        review: {
            type: String,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
    }],
    comments: [{
        comment: {
            type: String,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
    }],
    ratings: [{
        rating: {
            type: Number,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
    }],
    averageRating: { type: Number }, // from 0 to 5
}, { versionKey: false });

module.exports = mongoose.model('books', bookModel);
