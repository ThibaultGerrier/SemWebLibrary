const express = require('express');
const Books = require('../models/bookModel');
const User = require('../models/userModel');

const router = express.Router();

router.get('/', (req, res) => {
    // TODO filtering, sorting, limit, offset
    Books.find({}, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0, author: 0,
    }, (err, books) => {
        res.json(books);
    });
});

router.get('/search', (req, res) => {
    if (!req.query.q) {
        res.status(400).json({ message: 'missing query parameters', status: 'NOT OK' });
        return;
    }
    Books.find({ name: { $regex: `.*${req.query.q}.*`, $options: 'i' } }, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0, author: 0,
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
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: 'missing username or password', status: 'NOT OK' });
        return;
    }

    User.findOne({ username: req.body.username, password: req.body.password }, (err, existingUser) => {
        if (existingUser) {
            Books.findOne(
                { gutenbergId: req.params.bookId },
                (err, book) => {
                    if (book) {
                        if (book.availableQuantify > 0) {
                            book.buys.push(existingUser._id);
                            book.availableQuantify--;
                            book.totalQuantify--;
                            book.save();
                            const result = {
                                name: book.name,
                                downloadOptions: book.downloadOptions,
                            };
                            res.json(result);
                        } else {
                            res.status(400).json({ message: 'book not in stock', status: 'NOT OK' });
                        }
                    } else {
                        res.status(400).json({ message: 'book not found', status: 'NOT OK' });
                    }
                },
            );
        } else {
            res.status(400).json({ message: 'error getting user.. check your input', status: 'NOT OK' });
        }
    });
});

router.post('/:bookId/rent', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: 'missing username or password', status: 'NOT OK' });
        return;
    }

    User.findOne({ username: req.body.username, password: req.body.password }, (err, existingUser) => {
        if (existingUser) {
            Books.findOne(
                { gutenbergId: req.params.bookId },
                (err, book) => {
                    if (book) {
                        if (book.availableQuantify > 0) {
                            book.bookings.push(existingUser._id);
                            book.availableQuantify--;
                            book.save();
                            const result = {
                                name: book.name,
                                downloadOptions: book.downloadOptions,
                            };
                            existingUser.currentBooks.push(book._id);
                            existingUser.save();
                            res.json(result);
                        } else {
                            res.status(400).json({ message: 'book not in stock', status: 'NOT OK' });
                        }
                    } else {
                        res.status(400).json({ message: 'book not found', status: 'NOT OK' });
                    }
                },
            );
        } else {
            res.status(400).json({ message: 'error getting user.. check your input', status: 'NOT OK' });
        }
    });
});

router.post('/:bookId/comment', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: 'missing username or password', status: 'NOT OK' });
        return;
    }

    if (!req.body.comment) {
        res.status(400).json({ message: 'missing comment', status: 'NOT OK' });
        return;
    }

    User.findOne({ username: req.body.username, password: req.body.password }, (err, existingUser) => {
        if (existingUser) {
            Books.findOne(
                { gutenbergId: req.params.bookId },
                (err, book) => {
                    if (book) {
                        book.comments.push({ author: existingUser._id, comment: req.body.comment });
                        book.save();
                        res.json({ message: 'comment saved', status: 'OK' });
                    } else {
                        res.status(400).json({ message: 'book not found', status: 'NOT OK' });
                    }
                },
            );
        } else {
            res.status(400).json({ message: 'error getting user.. check your input', status: 'NOT OK' });
        }
    });
});

router.post('/:bookId/rate', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: 'missing username or password', status: 'NOT OK' });
        return;
    }

    if (!req.body.rating || typeof req.body.rating !== 'number') {
        res.status(400).json({ message: 'missing rating or wrong', status: 'NOT OK' });
        return;
    }

    User.findOne({ username: req.body.username, password: req.body.password }, (err, existingUser) => {
        if (existingUser) {
            Books.findOne(
                { gutenbergId: req.params.bookId },
                (err, book) => {
                    if (book) {
                        book.ratings.push({ author: existingUser._id, rating: req.body.rating });
                        book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.rating, 0) / book.ratings.length;
                        book.save();
                        res.json({ message: 'rating saved', status: 'OK' });
                    } else {
                        res.status(400).json({ message: 'book not found', status: 'NOT OK' });
                    }
                },
            );
        } else {
            res.status(400).json({ message: 'error getting user.. check your input', status: 'NOT OK' });
        }
    });
});

router.post('/:bookId/return', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: 'missing username or password', status: 'NOT OK' });
        return;
    }

    User.findOne({ username: req.body.username, password: req.body.password }, (err, existingUser) => {
        if (existingUser) {
            Books.findOne(
                { gutenbergId: req.params.bookId },
                (err, book) => {
                    if (book) {
                        if (existingUser.currentBooks.indexOf(book._id) !== -1) {
                            book.bookings.splice(book.bookings.indexOf(existingUser._id), 1);
                            existingUser.currentBooks.splice(existingUser.currentBooks.indexOf(book._id), 1);
                            book.availableQuantify++;
                            book.save();

                            existingUser.save();
                            res.status(200).json({ message: 'Thank you for returning the book', status: 'OK' });
                        } else {
                            res.status(400).json({ message: 'you do not have the book', status: 'NOT OK' });
                        }
                    } else {
                        res.status(400).json({ message: 'book not found', status: 'NOT OK' });
                    }
                },
            );
        } else {
            res.status(400).json({ message: 'error getting user.. check your input', status: 'NOT OK' });
        }
    });
});

module.exports = router;
