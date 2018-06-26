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
app.use(parser.json({type: 'application/ld+json'}));
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
            //DESCRIPTION FOR BOOK
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
                    {
                        '@id': '_:book_buy',
                        '@type': 'hydra:Operation',
                        method: 'POST',
                        label: 'Buy this book',
                        description: null,
                        expects: {
                            supportedProperty:[
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'username'
                                    },
                                    required:true
                                },
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'password'
                                    },
                                    required:true
                                },
                            ]
                        },
                        returns: 'http://schema.org/Book',
                        statusCodes: [],
                    },
                    {
                        '@id': '_:book_return',
                        '@type': 'hydra:Operation',
                        method: 'PUT',
                        label: 'Return this book',
                        description: null,
                        expects: {
                            supportedProperty:[
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'username'
                                    },
                                    required:true
                                },
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'password'
                                    },
                                    required:true
                                },
                            ]
                        },
                        returns: null,
                        statusCodes: [],
                    },
                    {
                        '@id': '_:book_rent',
                        '@type': 'hydra:Operation',
                        method: 'PATCH',
                        label: 'Rent this book',
                        description: null,
                        expects: {
                            supportedProperty:[
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'username'
                                    },
                                    required:true
                                },
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'password'
                                    },
                                    required:true
                                },
                            ]
                        },
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
                    {
                        property: 'http://schema.org/price',
                        'hydra:title': 'price',
                        'hydra:description': "The book's price",
                        required: true,
                        readonly: false,
                        writeonly: false,
                    },
                    {
                        property: {
                            '@id':'http://schema.org/comment',
                            '@type':'hydra:Link',
                            'label':'comments',
                            supportedOperation:[
                                {
                                    '@id': '_comment_create',
                                    '@type':'hydra:Operation',
                                    method: 'POST',
                                    label: 'create a comment',
                                    expects: {
                                        supportedProperty: [
                                            {
                                                property: {
                                                    '@type': 'rdf:Property',
                                                    'label': 'username'
                                                },
                                                required: true
                                            },
                                            {
                                                property: {
                                                    '@type': 'rdf:Property',
                                                    'label': 'password'
                                                },
                                                required: true
                                            },
                                            {
                                                property: {
                                                    '@type': 'rdf:Property',
                                                    'label': 'comment'
                                                },
                                                required: true
                                            },
                                        ]
                                    },
                                },
                                {
                                    '@id':'_comment_view',
                                    '@type':'hydra:Operation',
                                    method:'GET',
                                    label:'see all comments',
                                }
                            ]
                        },
                        'hydra:title':'comments',
                        'hydra:description':'Add a description to this book'
                    },
                    {
                        property: {
                            '@type': 'hydra:Link',
                            'range': 'http://schema.org/Person',
                            'domain':'http://schema.org/Book',
                            'description':"The author of the book",
                        },
                        'hydra:title': 'author',
                        'hydra:description': "The author of the book",
                        required: false,
                        readonly: true,
                        writeonly: false,

                    },
                ],
            },

            //DESCRIPTION FOR AUDIOBOOK
            {
                '@id': 'http://schema.org/AudioBook',
                '@type': 'hydra:Class',
                'hydra:title': 'AudioBook',
                'hydra:description': null,
                supportedOperation: [
                    {
                        '@id': '_:audiobook_retrieve',
                        '@type': 'hydra:Operation',
                        method: 'GET',
                        label: 'Retrieves a audiobook entity',
                        description: null,
                        expects: null,
                        returns: 'http://schema.org/Book',
                        statusCodes: [],
                    },
                    {
                        '@id': '_:audiobook_buy',
                        '@type': 'hydra:Operation',
                        method: 'POST',
                        label: 'Buy this audiobook',
                        description: null,
                        expects: {
                            supportedProperty:[
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'username'
                                    },
                                    required:true
                                },
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'password'
                                    },
                                    required:true
                                },
                            ]
                        },
                        returns: 'http://schema.org/Book',
                        statusCodes: [],
                    },
                    {
                        '@id': '_:audiobook_return',
                        '@type': 'hydra:Operation',
                        method: 'PUT',
                        label: 'Return this audiobook',
                        description: null,
                        expects: {
                            supportedProperty:[
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'username'
                                    },
                                    required:true
                                },
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'password'
                                    },
                                    required:true
                                },
                            ]
                        },
                        returns: 'http://schema.org/AudioBook',
                        statusCodes: [],
                    },
                    {
                        '@id': '_:audiobook_rent',
                        '@type': 'hydra:Operation',
                        method: 'PATCH',
                        label: 'Rent this audiobook',
                        description: null,
                        expects: {
                            supportedProperty:[
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'username'
                                    },
                                    required:true
                                },
                                {
                                    property:{
                                        '@type':'rdf:Property',
                                        'label':'password'
                                    },
                                    required:true
                                },
                            ]
                        },
                        returns: 'http://schema.org/AudioBook',
                        statusCodes: [],
                    },
                ],
                supportedProperty: [
                    {
                        property: 'http://schema.org/name',
                        'hydra:title': 'name',
                        'hydra:description': "The audiobook's name",
                        required: true,
                        readonly: false,
                        writeonly: false,
                    },
                    {
                        property: 'http://schema.org/price',
                        'hydra:title': 'price',
                        'hydra:description': "The audiobook's price",
                        required: true,
                        readonly: false,
                        writeonly: false,
                    },
                ],
            },

            //DESCRIPTION FOR AUTHORS
            {
                '@id': 'http://schema.org/Person',
                '@type': 'hydra:Class',
                'hydra:title': 'Person',
                'hydra:description': null,
                supportedOperation: [
                    {
                        '@id': '_:author_retrieve',
                        '@type': 'hydra:Operation',
                        method: 'GET',
                        label: 'Retrieves an author entity',
                        description: null,
                        expects: null,
                        returns: 'http://schema.org/Person',
                        statusCodes: [],
                    },
                ],
                supportedProperty: [
                    {
                        property: 'http://schema.org/name',
                        'hydra:title': 'name',
                        'hydra:description': "The author's name",
                        required: true,
                        readonly: false,
                        writeonly: false,
                    },
                    {
                        property: 'http://schema.org/date',
                        'hydra:title': 'date',
                        'hydra:description': "The author's birth date",
                        required: true,
                        readonly: false,
                        writeonly: false,
                    },
                ],
            },

            //*************ENTRYPOINT***********************************
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
                //******ENTRYPOINTPROPERTIES****************
                supportedProperty: [
                    //**************ENRTRYBOOKS***********************
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

                    //**********ENTRYAUDIOBOOKS****************
                    {
                        property: {
                            '@id': 'vocab:EntryPoint/audioBooks',
                            '@type': 'hydra:Link',
                            label: 'audiobooks',
                            description: 'The audio books collection',
                            domain: 'vocab:EntryPoint',
                            range: 'vocab:AudioBookCollection',
                            supportedOperation: [
                                {
                                    '@id': '_:audiobook_collection_retrieve',
                                    '@type': 'hydra:Operation',
                                    method: 'GET',
                                    label: 'Retrieves all audio-book entities',
                                    description: null,
                                    expects: null,
                                    returns: 'vocab:AudioBookCollection',
                                    statusCodes: [],
                                },
                            ],
                        },
                        'hydra:title': 'audiobooks',
                        'hydra:description': 'The audiobooks collection',
                        required: null,
                        readonly: true,
                        writeonly: false,
                    },
                    //**********ENTRYUSERS****************
                    {
                        property: {
                            '@id': 'vocab:EntryPoint/users',
                            '@type': 'hydra:Link',
                            label: 'users',
                            description: 'The user collection',
                            domain: 'vocab:EntryPoint',
                            range: 'vocab:UserCollection',
                            supportedOperation: [
                                {
                                    '@id': '_:user_collection_retrieve',
                                    '@type': 'hydra:Operation',
                                    method: 'POST',
                                    label: 'Add a new user',
                                    description: 'Add a user',
                                    expects: {
                                        supportedProperty:[
                                            {
                                                property:{
                                                    '@type':'rdf:Property',
                                                    'label':'username'
                                                },
                                                required:true
                                            },
                                            {
                                                property:{
                                                    '@type':'rdf:Property',
                                                    'label':'password'
                                                },
                                                required:true
                                            },
                                        ]
                                    },
                                    returns: 'vocab:UserCollection',
                                    statusCodes: [],
                                },
                            ],
                        },
                        'hydra:title': 'users',
                        'hydra:description': 'The user collection',
                        required: null,
                        readonly: true,
                        writeonly: false,
                    },

                    //**********ENTRYAUTHORS****************
                    {
                        property: {
                            '@id': 'vocab:EntryPoint/authors',
                            '@type': 'hydra:Link',
                            label: 'Person',
                            description: 'The authors collection',
                            domain: 'vocab:EntryPoint',
                            range: 'vocab:AuthorCollection',
                            supportedOperation: [
                                {
                                    '@id': '_:authors_collection_retrieve',
                                    '@type': 'hydra:Operation',
                                    method: 'GET',
                                    label: 'Retrieves all authors entities',
                                    description: null,
                                    expects: null,
                                    returns: 'vocab:AuthorCollection',
                                    statusCodes: [],
                                },
                            ],
                        },
                        'hydra:title': 'author',
                        'hydra:description': 'The authors collection',
                        required: null,
                        readonly: true,
                        writeonly: false,
                    },

                ],
            }
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
app.get('/api/contexts/AudioBookCollection.jsonld', (req, res) => {
    setRes(res);
    const e = {
        '@context': {
            hydra: 'http://www.w3.org/ns/hydra/core#',
            vocab: `${liveUrl}/api/vocab#`,
            AudioBookCollection: 'vocab:AudioBookCollection',
            members: 'http://www.w3.org/ns/hydra/core#member',
        },
    };
    res.send(e);
});
app.get('/api/contexts/UserCollection.jsonld', (req, res) => {
    setRes(res);
    const e = {
        '@context': {
            hydra: 'http://www.w3.org/ns/hydra/core#',
            vocab: `${liveUrl}/api/vocab#`,
            UserCollection: 'vocab:UserCollection',
            members: 'http://www.w3.org/ns/hydra/core#member',
        },
    };
    res.send(e);
});
app.get('/api/contexts/AuthorCollection.jsonld', (req, res) => {
    setRes(res);
    const e = {
        '@context': {
            hydra: 'http://www.w3.org/ns/hydra/core#',
            vocab: `${liveUrl}/api/vocab#`,
            AuthorCollection: 'vocab:AuthorCollection',
            members: 'http://www.w3.org/ns/hydra/core#member',
        },
    };
    res.send(e);
});

app.get('/api', (req, res) => {
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

