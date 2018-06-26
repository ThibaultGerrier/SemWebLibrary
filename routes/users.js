const express = require('express');
const User = require('../models/userModel');

const router = express.Router();

let CONFIG = require('../config/default.json');

const liveUrl = CONFIG.liveUrl;

const setRes = (res) => {
    res.set('Link', `<${liveUrl}/api/vocab>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"`);
    res.contentType('application/ld+json');
};

router.post('/', (req, res) => {
    setRes(res);
    if (!req.body.username || !req.body.password) {
        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 404,
            "title": "Error",
            "description": "Missing username or password",
        };
        res.send(e);
        return;
    }

    User.findOne({ username: req.body.username }, (err, existingUser) => {
        if (existingUser) {
            const e = {
                '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
                "@type": "Status",
                "statusCode": 404,
                "title": "Error",
                "description": "User already exists",
            };
            res.send(e);
            return;
        }
        const user = new User({
            username: req.body.username,
            password: req.body.password,
        });

        user.save();
        const simplifiedUser = {
            id: user._id,
            username: user.username,
            password: user.password,
        };

        const e = {
            '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
            "@type": "Status",
            "statusCode": 200,
            "title": "Success",
            "description": "User created",
        };
        res.send(e);
    });
});

router.get('/:userId', (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        res.json(user);
    });
});

module.exports = router;
