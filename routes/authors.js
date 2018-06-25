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
            '@context': '/api/contexts/BookCollection.jsonld',
            '@id': '/api/books/',
            '@type': 'BookCollection',
            members: [
            ],
        };
        authors.forEach(function(b){
            let temp={
                '@id': '/api/authors/'+b.gutenbergId,
                '@type': 'http://schema.org/Person',
                'name':b.name,
                'birthDate':b.birthDate
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
    console.log('yesssss');
    Author.findOne({ gutenbergId: req.params.userId }, { _id: 0 }, (err, author) => {
        res.json(author);
    });
});

module.exports = router;
