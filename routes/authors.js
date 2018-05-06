const express = require('express');
const Author = require('../models/authorModel');

const router = express.Router();

router.get('/', (req, res) => {
    // TODO filtering, sorting, limit, offset
    Author.find({}, { _id: 0, gutenbergId: 0, booksGutenbergIds: 0 }, (err, authors) => {
        res.json(authors);
    });
});

router.get('/:authorID', (req, res) => {
    Author.findById(req.params.userId, { _id: 0, gutenbergId: 0, booksGutenbergIds: 0 }, (err, author) => {
        res.json(author);
    });
});

module.exports = router;
