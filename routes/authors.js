const express = require('express');
const Author = require('../models/authorModel');

const router = express.Router();
let CONFIG = require('../config/default.json');
const liveUrl = CONFIG.liveUrl;

const setRes = (res) => {
    res.set('Link', `<${liveUrl}/api/vocab>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"`);
    res.contentType('application/ld+json');
};




router.get('/', (req, res) => {
    Author.find({}, { _id: 0 }, (err, authors) => {
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
                '@type': 'http://schema.org/Person',
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
            '@context': 'http://schema.org/',
            '@id': '/api/author/' + req.params.authorID,
            '@type': 'Person',
            name: author.name,
            date: author.birthDate
        };

        res.send(e);
    });
});

module.exports = router;
