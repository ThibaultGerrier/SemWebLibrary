const express = require('express');
const parser = require('body-parser');
const morgan = require('morgan');

const app = express();
app.use(parser.json());
app.use(parser.json({type: 'application/ld+json'}));

app.use(morgan('dev'));

const liveUrl = 'http://102e6ba1.ngrok.io';

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
                    {
                        '@id': '_:book_buy',
                        '@type': 'hydra:Operation',
                        method: 'POST',
                        label: 'Buy the book',
                        description: null,
                        expects: 'vocab:User',
                        returns: 'http://schema.org/Book',
                        statusCodes: [],
                    },
                    {
                        '@id': '_:book_rent',
                        '@type': 'hydra:Operation',
                        method: 'PATCH',
                        label: 'rent the book',
                        description: null,
                        expects: 'vocab:User',
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
                "@id": "vocab:User",
                "@type": "hydra:Class",
                "subClassOf": null,
                "label": "User",
                "description": "A User represents a person registered in the system.",
                "supportedOperation": [
                    {
                        "@id": "_:user_replace",
                        "@type": "hydra:Operation",
                        "method": "POST",
                        "label": "Replaces an existing User entity",
                        "description": null,
                        "expects": "vocab:User",
                        "returns": "vocab:User",
                        "statusCodes": [
                            {
                                "code": 404,
                                "description": "If the User entity wasn't found."
                            }
                        ]
                    },
                    {
                        "@id": "_:user_buy",
                        "@type": "hydra:Operation",
                        "method": "POST",
                        "label": "Replaces an existing User entity",
                        "description": null,
                        "expects": "vocab:User",
                        "returns": "vocab:User",
                        "statusCodes": [
                            {
                                "code": 404,
                                "description": "If the User entity wasn't found."
                            }
                        ]
                    },
                    {
                        "@id": "_:user_retrieve",
                        "@type": "hydra:Operation",
                        "method": "GET",
                        "label": "Retrieves a User entity",
                        "description": null,
                        "expects": null,
                        "returns": "vocab:User",
                        "statusCodes": []
                    }
                ],
                "supportedProperty": [
                    {
                        "property": {
                            "@id": "vocab:User/name",
                            "@type": "rdf:Property",
                            "label": "name",
                            "description": "The user's full name",
                            "domain": "vocab:User",
                            "range": "http://www.w3.org/2001/XMLSchema#string",
                            "supportedOperation": []
                        },
                        "hydra:title": "name",
                        "hydra:description": "The user's full name",
                        "required": null,
                        "readonly": false,
                        "writeonly": false
                    },
                    {
                        "property": {
                            "@id": "vocab:User/password",
                            "@type": "rdf:Property",
                            "label": "password",
                            "description": "The user's password",
                            "domain": "vocab:User",
                            "range": "http://www.w3.org/2001/XMLSchema#string",
                            "supportedOperation": []
                        },
                        "hydra:title": "password",
                        "hydra:description": "The user's password",
                        "required": null,
                        "readonly": false,
                        "writeonly": false
                    },
                ]
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
        },
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
    setRes(res);
    const e = {
        '@context': '/api/contexts/EntryPoint.jsonld',
        '@id': '/api/',
        '@type': 'EntryPoint',
        books: '/api/books/',
    };
    res.send(e);
});

app.get('/api/books', (req, res) => {
    setRes(res);
    const e = {
        '@context': '/api/contexts/BookCollection.jsonld',
        '@id': '/api/books/',
        '@type': 'BookCollection',
        members: [
            {
                '@id': '/api/books/123',
                '@type': 'http://schema.org/Book',
            },
        ],
    };
    res.send(e);
});

app.get('/api/books/123', (req, res) => {
    setRes(res);
    const e = {
        '@context': 'http://schema.org/',
        '@id': '/api/books/123',
        '@type': 'Book',
        name: 'Alice in the wonderland',
    };
    res.send(e);
});

app.post('/api/books/123', (req, res) => {

    console.log('BOUGHT BOOK');
    console.log(req.body);

    setRes(res);
    const e = {
        '@context': 'http://schema.org/',
        '@id': '/api/books/123',
        '@type': 'Book',
        name: 'Alice in the wonderland',
    };
    res.send(e);
});

app.patch('/api/books/123', (req, res) => {

    console.log('BOUGHT BOOK');
    console.log(req.body);

    setRes(res);
    const e = {
        '@context': 'http://schema.org/',
        '@id': '/api/books/123',
        '@type': 'Book',
        name: 'Alice in the wonderland',
    };
    res.send(e);
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

