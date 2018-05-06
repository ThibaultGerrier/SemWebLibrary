const mongoose = require('mongoose');

const authorModel = new mongoose.Schema({
    name: { type: String },
    alternateName: { type: String },
    gutenbergId: { type: String },
    booksGutenbergIds: [{ type: String }],
    deathDate: { type: String },
    birthDate: { type: String },
    utl: { type: String },
}, { versionKey: false });

module.exports = mongoose.model('authors', authorModel);
