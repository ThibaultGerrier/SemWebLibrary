const express = require('express');
const Books = require('../models/bookModel');

const router = express.Router();

router.get('/', (req, res) => {
    // TODO filtering, sorting, limit, offset
    Books.find({}, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0,
    }, (err, books) => {
        res.json(books);
    });
});

router.get('/:bookId', (req, res) => {
    Books.findOne({ gutenbergId: req.params.bookId }, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0,
    }, (err, book) => {
        res.json(book);
    });
});

router.post('/:bookId/buy', (req, res) => {
    // TODO buy book
});

router.post('/:bookId/rent', (req, res) => {
    // TODO rend book
});

router.post('/:bookId/comment', (req, res) => {
    // TODO comment book
});

router.post('/:bookId/rate', (req, res) => {
    // TODO rate book
});

module.exports = router;
