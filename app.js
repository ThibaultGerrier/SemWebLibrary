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

