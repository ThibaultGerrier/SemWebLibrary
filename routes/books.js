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
    setRes(res);
    Books.find({}, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0, author: 0,
    }, {limit: 100}, (err, books) => {
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
                '@type': 'vocab:Book',
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

// new search
router.post('/', (req, res) => {
    setRes(res);
    if (!req.body.query) {
        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 404,
            "title": "No query param",
        };
        res.send(e);
        return;
    }
    Books.find({ name: { $regex: `.*${req.body.query}.*`, $options: 'i' } }, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0, author: 0,
    }, {limit: 100}, (err, books) => {
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
                '@type': 'vocab:Book',
            };
            e.members.push(temp)
        });
        res.send(e);
    });
});

router.get('/:bookId', (req, res) => {
    setRes(res);
    Books.findOne({ gutenbergId: req.params.bookId }, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0,
    }, (err, book) => {
        let authID=null;
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
            authID='/api/authors/'+book.authorGutenbergId;
        }
        const e = {
            '@context': liveUrl + '/api/contexts/Book.jsonld',
            '@id': '/api/books/' + req.params.bookId,
            '@type': 'Book',
            name: book.name,
            price: book.price,
            averageRating: book.averageRating,
            subject: book.subject,
            bookshelf: book.bookshelf,
            alternateName: book.alternateName,
            available: book.availableQuantify,
            author: authID,
            comments:'/api/books/' + req.params.bookId+'/comments',
            ratings:'/api/books/' + req.params.bookId+'/ratings',
        };

        res.send(e);
    });
});

router.post('/:bookId', (req, res) => { //buy
    setRes(res);
    if (!req.body.username || !req.body.password) {
        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 404,
            "title": "User not found",
            "description": "Sorry, username or password wrong",
        };
        res.send(e);
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
                            const e = {
                                '@context': 'http://schema.org/',
                                '@id': '/api/books/' + req.params.bookId,
                                '@type': 'Book',
                                name: book.name,
                                associatedMedia:book.downloadOptions.map(function(b){
                                   const r = {
                                       encodingFormat: b.type,
                                       contentUrl:b.url
                                   };
                                   return r;
                                }),
                            };

                            res.send(e);
                        } else {
                            const e = {
                                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                                "@type": "Status",
                                "statusCode": 404,
                                "title": "Book not found",
                                "description": "Sorry, not in stock",
                            };
                            res.send(e);
                        }
                    } else {
                        const e = {
                            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                            "@type": "Status",
                            "statusCode": 404,
                            "title": "Book not found",
                            "description": "Sorry, book not found",
                        };
                        res.send(e);
                    }
                },
            );
        } else {
            const e = {
                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                "@type": "Status",
                "statusCode": 404,
                "title": "User not found",
                "description": "Sorry, username not found. check your input",
            };
            res.send(e);
        }
    });
});

router.patch('/:bookId', (req, res) => { //rent
    setRes(res);
    if (!req.body.username || !req.body.password) {
        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 400,
            "title": "User not found",
            "description": "Sorry, username and password required",
        };
        res.send(e);
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
                            existingUser.currentBooks.push(book._id);
                            existingUser.save();

                            const e = {
                                '@context': 'http://schema.org/',
                                '@id': '/api/books/' + req.params.bookId,
                                '@type': 'Book',
                                name: book.name,
                                associatedMedia:book.downloadOptions.map(function(b){
                                    const r = {
                                        encodingFormat: b.type,
                                        contentUrl:b.url
                                    };
                                    return r;
                                }),
                            };
                            res.send(e);
                        } else {
                            const e = {
                                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                                "@type": "Status",
                                "statusCode": 404,
                                "title": "Book not found",
                                "description": "Sorry, book not in stock",
                            };
                            res.send(e);
                        }
                    } else {
                        const e = {
                            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                            "@type": "Status",
                            "statusCode": 404,
                            "title": "Book not found",
                            "description": "Sorry, book not found",
                        };
                        res.send(e);
                    }
                },
            );
        } else {
            const e = {
                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                "@type": "Status",
                "statusCode": 400,
                "title": "User not found",
                "description": "Error getting user, please check your input",
            };
            res.send(e);
        }
    });
});

router.get('/:bookId/comments', (req, res) => {
    setRes(res);
    Books.findOne(
        { gutenbergId: req.params.bookId },
        (err, book) => {
            if (book) {
                const e = {
                    '@context': '/api/contexts/CommentCollection.jsonld',
                    '@id': '/api/books/',
                    '@type': 'CommentCollection',
                    members: [
                    ],
                };
                book.comments.forEach(function(c, i){
                    let temp={
                        '@id': '/api/books/'+ book.gutenbergId + '/comments/' + i,
                        '@type': 'vocab:Comment',
                    };
                    e.members.push(temp)
                });
                res.send(e);
            } else {
                const e = {
                    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                    "@type": "Status",
                    "statusCode": 404,
                    "title": "Book not found",
                    "description": "Error getting book",
                };
                res.send(e);
            }
        },
    );
});

router.get('/:bookId/comments/:commentId', (req, res) => {
    setRes(res);
    Books.findOne(
        { gutenbergId: req.params.bookId },
        (err, book) => {
            if (book) {
                const e = {
                    '@context': liveUrl + '/api/contexts/Comment.jsonld',
                    '@id': '/api/books/' + req.params.bookId + '/comments/' + req.params.commentId,
                    '@type': 'Comment',
                    comment: book.comments[req.params.commentId].comment,
                    'book': '/api/books/' + req.params.bookId
                };
                res.send(e);
            } else {
                const e = {
                    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                    "@type": "Status",
                    "statusCode": 404,
                    "title": "Book not found",
                    "description": "Error getting book",
                };
                res.send(e);
            }
        },
    );

});

router.post('/:bookId/comments', (req, res) => {
    setRes(res);

    if (!req.body.comment) {
        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 400,
            "title": "No comment found",
            "description": "No comment found",
        };
        res.send(e);
        return;
    }
    Books.findOne(
        { gutenbergId: req.params.bookId },
        (err, book) => {
            if (book) {
                book.comments.push({ comment: req.body.comment });
                book.save();
                const e = {
                    '@context': liveUrl + '/api/contexts/Comment.jsonld',
                    '@id': '/api/books/' + req.params.bookId + '/comments/' + (book.comments.length -1),
                    '@type': 'Comment',
                    comment: req.body.comment,
                    'book': '/api/books/' + req.params.bookId
                };
                res.send(e);
            } else {
                const e = {
                    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                    "@type": "Status",
                    "statusCode": 404,
                    "title": "Book not found",
                    "description": "Book not found",
                };
                res.send(e);
            }
        },
    );
});

router.get('/:bookId/ratings', (req, res) => {
    setRes(res);
    Books.findOne(
        { gutenbergId: req.params.bookId },
        (err, book) => {
            if (book) {
                const e = {
                    '@context': '/api/contexts/RatingCollection.jsonld',
                    '@id': '/api/books/',
                    '@type': 'RatingCollection',
                    members: [
                    ],
                };
                book.ratings.forEach(function(c, i){
                    let temp={
                        '@id': '/api/books/'+ book.gutenbergId + '/ratings/' + i,
                        '@type': 'vocab:Rating',
                    };
                    e.members.push(temp)
                });
                res.send(e);
            } else {
                const e = {
                    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                    "@type": "Status",
                    "statusCode": 404,
                    "title": "Book not found",
                    "description": "Error getting book",
                };
                res.send(e);
            }
        },
    );
});

router.get('/:bookId/ratings/:ratingId', (req, res) => {
    setRes(res);
    Books.findOne(
        { gutenbergId: req.params.bookId },
        (err, book) => {
            if (book) {
                const e = {
                    '@context': liveUrl + '/api/contexts/Rating.jsonld',
                    '@id': '/api/books/' + req.params.bookId + '/ratings/' + req.params.commentId,
                    '@type': 'Rating',
                    rating: book.ratings[req.params.ratingId].rating,
                    'book': '/api/books/' + req.params.bookId
                };
                res.send(e);
            } else {
                const e = {
                    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                    "@type": "Status",
                    "statusCode": 404,
                    "title": "Book not found",
                    "description": "Error getting book",
                };
                res.send(e);
            }
        },
    );

});

router.post('/:bookId/ratings', (req, res) => {
    setRes(res);
    const rating = Number(req.body.rating);
    if (!req.body.rating || isNaN(rating)) {
        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 404,
            "title": "Set a valid rating",
        };
        res.send(e);
        return;
    }

    Books.findOne(
        { gutenbergId: req.params.bookId },
        (err, book) => {
            if (book) {
                book.ratings.push({ rating: req.body.rating });
                book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.rating, 0) / book.ratings.length;
                book.save();
                const e = {
                    '@context': liveUrl + '/api/contexts/Rating.jsonld',
                    '@id': '/api/books/' + req.params.bookId + '/ratings/' + (book.ratings.length - 1),
                    '@type': 'Rating',
                    rating: req.body.rating,
                    'book': '/api/books/' + req.params.bookId
                };
                res.send(e);
            } else {
                const e = {
                    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                    "@type": "Status",
                    "statusCode": 404,
                    "title": "Book not found",
                };
                res.send(e);
            }
        },
    );

});

router.put('/:bookId/', (req, res) => { //return
    setRes(res);
    if (!req.body.username || !req.body.password) {
        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 400,
            "title": "User not found",
            "description": "Error: username and password required",
        };
        res.send(e);
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
                            const e = {
                                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                                "@type": "Status",
                                "statusCode": 200,
                                "title": "Successful",
                                "description": "Thank you for returning the book!",
                            };
                            res.send(e);
                        } else {
                            const e = {
                                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                                "@type": "Status",
                                "statusCode": 400,
                                "title": "Not allowed",
                                "description": "You do not have the book",
                            };
                            res.send(e);
                        }
                    } else {
                        const e = {
                            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                            "@type": "Status",
                            "statusCode": 404,
                            "title": "Not found",
                            "description": "Error: username and password required incorrect",
                        };
                        res.send(e);
                    }
                },
            );
        } else {
            const e = {
                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                "@type": "Status",
                "statusCode": 400,
                "title": "Book not found",
                "description": "Error getting user, please check your input",
            };
            res.send(e);
        }
    });
});

module.exports = router;
