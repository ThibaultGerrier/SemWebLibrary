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
    Books.find({audioBook:true}, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0, author: 0,
    }, (err, books) => {
        setRes(res);
        const e = {
            '@context': '/api/contexts/AudioBookCollection.jsonld',
            '@id': '/api/audioBooks/',
            '@type': 'AudioBookCollection',
            members: [
            ],
        };
        books.forEach(function(b){
            let temp={
                '@id': '/api/audioBooks/'+b.gutenbergId,
                '@type': 'http://schema.org/AudioBook',
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
    Books.find({ name: { $regex: `.*${req.query.q}.*`, $options: 'i' } ,audioBook:true}, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0, author: 0,
    }, (err, books) => {
        res.json(books);
    });
});

router.get('/:bookId', (req, res) => {
    Books.findOne({ gutenbergId: req.params.bookId ,audioBook:true}, {
        _id: 0, downloadOptions: 0, bookings: 0, buys: 0, totalQuantify: 0,
    }, (err, book) => {
        setRes(res);
        let authID=null;
        if(!book){
            const e = {
                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                "@type": "Status",
                "statusCode": 404,
                "title": "Book not found",
                "description": "Sorry, this audiobook is not in our library",
            };
            res.send(e);
            return;
        }
        if(book.author){
            authID='/api/authors/'+book.authorGutenbergId;
        }
        const e = {
            '@context': 'http://schema.org/',
            '@id': '/api/audioBooks/' + req.params.bookId,
            '@type': 'AudioBook',
            name: book.name,
            price: book.price,
            author: authID,
            comments:'/api/audioBooks/' + req.params.bookId+'/comments',
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
                { gutenbergId: req.params.bookId ,audioBook:true},
                (err, book) => {
                    if (book) {
                        if (book.availableQuantify > 0) {
                            book.buys.push(existingUser._id);
                            book.availableQuantify--;
                            book.totalQuantify--;
                            book.save();
                            const e = {
                                '@context': 'http://schema.org/',
                                '@id': '/api/audioBooks/' + req.params.bookId,
                                '@type': 'AudioBook',
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
                                "title": "Audiobook not found",
                                "description": "Sorry, not in stock",
                            };
                            res.send(e);
                        }
                    } else {
                        const e = {
                            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                            "@type": "Status",
                            "statusCode": 404,
                            "title": "Audiobook not found",
                            "description": "Sorry, Audiobook not found",
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
                { gutenbergId: req.params.bookId ,audioBook:true},
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
                                '@id': '/api/audioBooks/' + req.params.bookId,
                                '@type': 'AudioBook',
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
                                "title": "Audiobook not found",
                                "description": "Sorry, audiobook not in stock",
                            };
                            res.send(e);
                        }
                    } else {
                        const e = {
                            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                            "@type": "Status",
                            "statusCode": 404,
                            "title": "Audiobook not found",
                            "description": "Sorry, audiobook not found",
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
                { gutenbergId: req.params.bookId, audioBook:true},
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
                { gutenbergId: req.params.bookId ,audioBook:true},
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
                { gutenbergId: req.params.bookId ,audioBook:true},
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
                                "description": "Thank you for returning the audiobook!",
                            };
                            res.send(e);
                        } else {
                            const e = {
                                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                                "@type": "Status",
                                "statusCode": 400,
                                "title": "Not allowed",
                                "description": "You do not have the audiobook",
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
                "title": "Audiobook not found",
                "description": "Error getting user, please check your input",
            };
            res.send(e);
        }
    });
});

module.exports = router;
