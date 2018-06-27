const express = require('express');
const Author = require('../models/authorModel');
const Books = require('../models/bookModel');

const router = express.Router();
let CONFIG = require('../config/default.json');
const liveUrl = CONFIG.liveUrl;

const setRes = (res) => {
    res.set('Link', `<${liveUrl}/api/vocab>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"`);
    res.contentType('application/ld+json');
};

router.get('/', (req, res) => {
    Author.find({}, { _id: 0 }, {limit: 100}, (err, authors) => {
        setRes(res);
        const e = {
            '@context': '/api/contexts/AuthorCollection.jsonld',
            '@id': '/api/authors/',
            '@type': 'AuthorCollection',
            members: [
            ],
        };
        authors.forEach(function(b){
            let temp={
                '@id': '/api/authors/'+b.gutenbergId,
                '@type': 'vocab:Author',
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
    Author.find({ name: { $regex: `.*${req.query.q}.*`, $options: 'i' } }, {
        _id: 0,
    }, (err, authors) => {
        res.json(authors);
    });
});

// new search
router.post('/', (req, res) => {
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
    Author.find({ name: { $regex: `.*${req.body.query}.*`, $options: 'i' } }, {
        _id: 0,
    }, {limit: 100}, (err, authors) => {
        const e = {
            '@context': '/api/contexts/AuthorCollection.jsonld',
            '@id': '/api/authors/',
            '@type': 'AuthorCollection',
            members: [
            ],
        };
        authors.forEach(function(a){
            let temp={
                '@id': '/api/authors/'+a.gutenbergId,
                '@type': 'vocab:Author',
            };
            e.members.push(temp)
        });
        res.send(e);
    });
});

router.get('/:authorID', (req, res) => {
    Author.findOne({ gutenbergId: req.params.authorID }, { _id: 0 }, (err, author) => {
        setRes(res);
        if(!author){
            const e = {
                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                "@type": "Status",
                "statusCode": 404,
                "title": "Author not found",
                "description": "Sorry, this author does not exist",
            };
            res.send(e);
            return;
        }

        const e = {
            '@context': liveUrl + '/api/contexts/Author.jsonld',
            '@id': '/api/author/' + req.params.authorID,
            '@type': 'Author',
            name: author.name,
            date: author.birthDate,
            books: '/api/authors/' + req.params.authorID + '/books',
        };

        res.send(e);
    });
});

router.get('/:authorID/books', (req, res) => {
    setRes(res);
    Books.find({ authorGutenbergId: req.params.authorID }, { _id: 0 },
        (err, books) => {
            const e = {
                '@context': '/api/contexts/BookCollection.jsonld',
                '@id': '/api/' + req.params.authorID + '/books',
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

module.exports = router;
