
`SUPPORTED ROUTES

GET	/authors/
GET	/authors/:authorId
GET	/authors/search?q

POST	/users/
GET	/users/:userId

GET	    /books/
GET	    /books/search?q
GET	    /books/:bookId
POST	/books/:bookId/buy
POST	/books/:bookId/rent
POST	/books/:bookId/return
POST	/books/:bookId/comment
POST	/books/:bookId/rate

GET	    /audioBooks/
GET	    /audioBooks/search?q
GET	    /audioBooks/:bookId
POST	/audioBooks/:bookId/buy
POST	/audioBooks/:bookId/rent
POST	/audioBooks/:bookId/return
POST	/audioBooks/:bookId/comment
POST	/audioBooks/:bookId/rate
`;


const express = require('express');
const parser = require('body-parser');
const config = require('config');
const morgan = require('morgan');
const mongoose = require('mongoose');

const bookRouter = require('./routes/books');
const audioBookRouter = require('./routes/audioBooks');
const userRouter = require('./routes/users');
const authorRouter = require('./routes/authors');

const app = express();
app.use(parser.json());
app.use(morgan('dev'));

mongoose.connect('mongodb://localhost/semweblibrary');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/books', bookRouter);
app.use('/audioBooks', audioBookRouter);
app.use('/authors', authorRouter);
app.use('/users', userRouter);

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

