const express = require('express');
const Author = require('../models/authorModel');

const router = express.Router();

router.get('/', (req, res) => {
    Author.find({}, { _id: 0 }, (err, authors) => {
        res.json(authors);
    });
});

router.get('/search', (req, res) => {
    if (!req.query.q) {
        res.status(400).json({ message: 'missing query parameters', status: 'NOT OK' });
        return;
    }
    Author.find({ name: { $regex: `.*${req.query.q}.*`, $options: 'i' } }, {
        _id: 0,
    }, (err, authors) => {
        res.json(authors);
    });
});

router.get('/:authorID', (req, res) => {
    Author.findOne({ gutenbergId: req.params.userId }, { _id: 0 }, (err, author) => {
        res.json(author);
    });
});

module.exports = router;
