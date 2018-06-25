const express = require('express');
const Books = require('../models/bookModel');
const User = require('../models/userModel');

const router = express.Router();

let CONFIG = require('../config/default.json');

const liveUrl = CONFIG.liveUrl;

const setRes = (res) => {
    res.set('Link', `<${liveUrl}/api/vocab>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"`);
    res.contentType('application/ld+json');
};

router.get('/', (req, res) => {
    Books.find({}, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0, author: 0,
    }, (err, books) => {
        setRes(res);
        const e = {
            '@context': '/api/contexts/BookCollection.jsonld',
            '@id': '/api/books/',
            '@type': 'BookCollection',
            members: [
            ],
        };
        books.forEach(function(b){
            let temp={
                '@id': '/api/books/'+b.gutenbergId,
                '@type': 'http://schema.org/Book',
            };
            e.members.push(temp)
        });
        res.send(e);
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
        setRes(res);
        let authName=null;
        if(!book){
            const e = {
                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                "@type": "Status",
                "statusCode": 404,
                "title": "Book not found",
                "description": "Sorry, this book is not in our library",
            };
            res.send(e);
            return;
        }
        if(book.author){
            authName=book.author.name;
        }
        const e = {
            '@context': 'http://schema.org/',
            '@id': '/api/books/'+req.params.bookId,
            '@type': 'Book',
            name : book.name,
            price: book.price,
            author: authName,
        };
        res.send(e);
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
