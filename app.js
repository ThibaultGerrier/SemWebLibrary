
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

let CONFIG = require('./config/default.json');

const liveUrl = CONFIG.liveUrl;

mongoose.connect('mongodb://localhost/semweblibrary');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const setRes = (res) => {
    res.set('Link', `<${liveUrl}/api/vocab>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"`);
    res.contentType('application/ld+json');
};

app.get('/api/vocab', (req, res) => {
    setRes(res);
    const e = {
        '@context': {
            vocab: `${liveUrl}/api/vocab#`,
            hydra: 'http://www.w3.org/ns/hydra/core#',
            ApiDocumentation: 'hydra:ApiDocumentation',
            property: {
                '@id': 'hydra:property',
                '@type': '@id',
            },
            readonly: 'hydra:readonly',
            writeonly: 'hydra:writeonly',
            supportedClass: 'hydra:supportedClass',
            supportedProperty: 'hydra:supportedProperty',
            supportedOperation: 'hydra:supportedOperation',
            method: 'hydra:method',
            expects: {
                '@id': 'hydra:expects',
                '@type': '@id',
            },
            returns: {
                '@id': 'hydra:returns',
                '@type': '@id',
            },
            statusCodes: 'hydra:statusCodes',
            code: 'hydra:statusCode',
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            label: 'rdfs:label',
            description: 'rdfs:comment',
            domain: {
                '@id': 'rdfs:domain',
                '@type': '@id',
            },
            range: {
                '@id': 'rdfs:range',
                '@type': '@id',
            },
            subClassOf: {
                '@id': 'rdfs:subClassOf',
                '@type': '@id',
            },
        },
        '@id': `${liveUrl}/api/vocab`,
        '@type': 'ApiDocumentation',
        supportedClass: [
            {
                '@id': 'http://www.w3.org/ns/hydra/core#Collection',
                '@type': 'hydra:Class',
                'hydra:title': 'Collection',
                'hydra:description': null,
                supportedOperation: [],
                supportedProperty: [
                    {
                        property: 'http://www.w3.org/ns/hydra/core#member',
                        'hydra:title': 'members',
                        'hydra:description': 'The members of this collection.',
                        required: null,
                        readonly: false,
                        writeonly: false,
                    },
                ],
            },
            {
                '@id': 'http://www.w3.org/ns/hydra/core#Resource',
                '@type': 'hydra:Class',
                'hydra:title': 'Resource',
                'hydra:description': null,
                supportedOperation: [],
                supportedProperty: [],
            },
            {
                '@id': 'http://schema.org/Book',
                '@type': 'hydra:Class',
                'hydra:title': 'Book',
                'hydra:description': null,
                supportedOperation: [
                    {
                        '@id': '_:book_retrieve',
                        '@type': 'hydra:Operation',
                        method: 'GET',
                        label: 'Retrieves a Book entity',
                        description: null,
                        expects: null,
                        returns: 'http://schema.org/Book',
                        statusCodes: [],
                    },
                ],
                supportedProperty: [
                    {
                        property: 'http://schema.org/name',
                        'hydra:title': 'name',
                        'hydra:description': "The book's name",
                        required: true,
                        readonly: false,
                        writeonly: false,
                    },
                ],
            },
            {
                '@id': 'vocab:EntryPoint',
                '@type': 'hydra:Class',
                subClassOf: null,
                label: 'EntryPoint',
                description: 'The main entry point or homepage of the API.',
                supportedOperation: [
                    {
                        '@id': '_:entry_point',
                        '@type': 'hydra:Operation',
                        method: 'GET',
                        label: 'The APIs main entry point.',
                        description: null,
                        expects: null,
                        returns: 'vocab:EntryPoint',
                        statusCodes: [],
                    },
                ],
                supportedProperty: [
                    {
                        property: {
                            '@id': 'vocab:EntryPoint/books',
                            '@type': 'hydra:Link',
                            label: 'books',
                            description: 'The books collection',
                            domain: 'vocab:EntryPoint',
                            range: 'vocab:BookCollection',
                            supportedOperation: [
                                {
                                    '@id': '_:book_collection_retrieve',
                                    '@type': 'hydra:Operation',
                                    method: 'GET',
                                    label: 'Retrieves all Book entities',
                                    description: null,
                                    expects: null,
                                    returns: 'vocab:BookCollection',
                                    statusCodes: [],
                                },
                            ],
                        },
                        'hydra:title': 'books',
                        'hydra:description': 'The books collection',
                        required: null,
                        readonly: true,
                        writeonly: false,
                    },
                ],
            },
            {
                '@id': 'vocab:BookCollection',
                '@type': 'hydra:Class',
                subClassOf: 'http://www.w3.org/ns/hydra/core#Collection',
                label: 'BookCollection',
                description: 'A collection of books',
                supportedOperation: [
                    {
                        '@id': '_:book_collection_retrieve',
                        '@type': 'hydra:Operation',
                        method: 'GET',
                        label: 'Retrieves all Book entities',
                        description: null,
                        expects: null,
                        returns: 'vocab:BookCollection',
                        statusCodes: [],
                    },
                ],
                supportedProperty: [
                    {
                        property: 'http://www.w3.org/ns/hydra/core#member',
                        'hydra:title': 'members',
                        'hydra:description': 'The books',
                        required: null,
                        readonly: false,
                        writeonly: false,
                    },
                ],
            },
        ],
    };
    res.send(e);
});

app.get('/api/contexts/BookCollection.jsonld', (req, res) => {
    setRes(res);
    const e = {
        '@context': {
            hydra: 'http://www.w3.org/ns/hydra/core#',
            vocab: `${liveUrl}/api/vocab#`,
            BookCollection: 'vocab:BookCollection',
            members: 'http://www.w3.org/ns/hydra/core#member',
        },
    };
    res.send(e);
});

app.get('/api', (req, res) => {
    console.log('yess');
    setRes(res);
    const e = {
        '@context': '/api/contexts/EntryPoint.jsonld',
        '@id': '/api/',
        '@type': 'EntryPoint',
        books: '/api/books/',
        audioBooks: '/api/audioBooks/',
        authors: '/api/authors/',
        users: '/api/users/',
    };
    res.send(e);
});

app.get('/api/contexts/EntryPoint.jsonld', (req, res) => {
    setRes(res);
    const e = {
        '@context': {
            hydra: 'http://www.w3.org/ns/hydra/core#',
            vocab: `${liveUrl}/api/vocab#`,
            EntryPoint: 'vocab:EntryPoint',
            books: {
                '@id': 'vocab:EntryPoint/books',
                '@type': '@id',
            },
            audioBooks: {
                '@id': 'vocab:EntryPoint/audioBooks',
                '@type': '@id',
            },
            authors: {
                '@id': 'vocab:EntryPoint/authors',
                '@type': '@id',
            },
            users: {
                '@id': 'vocab:EntryPoint/users',
                '@type': '@id',
            },
        },
    };
    res.send(e);
});

app.use('/api/books', bookRouter);
app.use('/api/audioBooks', audioBookRouter);
app.use('/api/authors', authorRouter);
app.use('/api/users', userRouter);



app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

