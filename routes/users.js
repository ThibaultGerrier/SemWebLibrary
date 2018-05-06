const express = require('express');
const User = require('../models/userModel');

const router = express.Router();

router.post('/', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ message: 'missing username or password', status: 'NOT OK' });
        return;
    }

    User.findOne({ username: req.body.username }, (err, existingUser) => {
        if (existingUser) {
            res.status(400).json({ message: 'username already exists', status: 'NOT OK' });
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

        res.send({ message: 'user created', status: 'OK', user: simplifiedUser });
    });
});

router.get('/:userId', (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        res.json(user);
    });
});

module.exports = router;
