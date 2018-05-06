const request = require('request');

request.post({
    url: 'http://localhost:3000/users',
    json: {
        username: 'user',
        password: 'asd',
    },
}, (err, res, body) => {
    console.log(body);
});
