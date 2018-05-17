const fs = require('fs');
const xml2js = require('xml2js');
const readline = require('readline');
const mongoose = require('mongoose');

const Books = require('../models/bookModel');
const Authors = require('../models/authorModel');

const { parseString } = new xml2js.Parser({ explicitCharkey: true });

const numberBooks = 1000;

const books = [];
const authors = [];

const printProgress = (p) => {
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`waiting ... ${p * 100}%`);
};

const finish = () => {
    mongoose.connection.close();
};

const nextStep = (xmlObjects) => {
    console.log();
    console.log('processing data ...');
    xmlObjects.forEach((obj, i) => {
        printProgress(i / xmlObjects.length);
        // console.log(obj['rdf:RDF']['pgterms:ebook'][0].$['rdf:about']);
        if (obj['rdf:RDF']['pgterms:ebook'][0]['dcterms:title']) {
            const bookObj = obj['rdf:RDF']['pgterms:ebook'][0];
            const authorObj = bookObj['dcterms:creator'] ? bookObj['dcterms:creator'][0]['pgterms:agent'][0] : undefined;
            let authorId;
            const bookId = bookObj.$['rdf:about'].replace(/\D+/g, '');
            if (authorObj) {
                authorId = authorObj.$['rdf:about'];
                authorId = authorId.substr(authorId.lastIndexOf('/') + 1);
                if (!authors.some(e => e.gutenbergId === authorId)) {
                    authors.push({
                        gutenbergId: authorId,
                        name: authorObj['pgterms:name'][0]._,
                        alternateName: authorObj['pgterms:alias'] ? authorObj['pgterms:alias'][0]._ : undefined,
                        birthDate: authorObj['pgterms:birthdate'] ? authorObj['pgterms:birthdate'][0]._ : undefined,
                        deathDate: authorObj['pgterms:deathdate'] ? authorObj['pgterms:deathdate'][0]._ : undefined,
                        url: authorObj['pgterms:webpage'] ? authorObj['pgterms:webpage'][0].$['rdf:resource'] : undefined,
                        booksGutenbergIds: [bookId],
                    });
                } else {
                    const foundIndex = authors.findIndex(e => e.gutenbergId === authorId);
                    const foundAuthor = authors[foundIndex];
                    authors[foundIndex].booksGutenbergIds.push(bookId);
                    authors[foundIndex] = foundAuthor;
                }
            }
            books.push({
                gutenbergId: bookId,
                name: bookObj['dcterms:title'][0]._,
                alternateName: bookObj['dcterms:alternative'] ? bookObj['dcterms:alternative'][0]._ : undefined,
                subject: bookObj['dcterms:subject'] ?
                    bookObj['dcterms:subject'].map(s => s['rdf:Description'][0]['rdf:value'][0]._)
                    : undefined,
                bookshelf: bookObj['pgterms:bookshelf'] ? bookObj['pgterms:bookshelf'][0]['rdf:Description'][0]['rdf:value'][0]._ : undefined,
                downloadOptions: bookObj['dcterms:hasFormat'].map(o => (
                    {
                        type: o['pgterms:file'][0]['dcterms:format'][0]['rdf:Description'][0]['rdf:value'][0]._,
                        url: o['pgterms:file'][0].$['rdf:about'],
                    })),
                authorGutenbergId: authorId,
                audioBook: bookObj['dcterms:type'][0]['rdf:Description'][0]['rdf:value'][0]._ === 'Sound',
            });
        }
    });
    // console.log(JSON.stringify(books, null, 2));
    // console.log(JSON.stringify(authors, null, 2));
    // Books.insertMany(rawDocuments, function (err, mongooseDocuments) { /* Your callback function... */ });
    console.log();
    Authors.insertMany(authors, (authorErr, authorDocs) => {
        if (authorErr) {
            console.log(authorErr);
            return;
        }
        const booksWithIds = books.map((b) => {
            const newBook = b;
            const author = authorDocs.find(a => a.gutenbergId === b.authorGutenbergId);
            // delete newBook.authorGutenbergId;
            newBook.author = author ? author._id : undefined;

            // Extra stuff
            const maxPrice = 50;
            const minPrice = 5;
            newBook.price = ((Math.random() * maxPrice) + minPrice).toFixed(2);

            newBook.totalQuantify = 2;
            newBook.availableQuantify = 2;

            newBook.bookings = [];
            newBook.buys = [];
            newBook.ratings = [];
            newBook.averageRating = 0;
            newBook.commets = [];
            newBook.reviews = [];

            return newBook;
        });
        Books.insertMany(booksWithIds, (bookErr, bookDocs) => {
            if (bookErr) {
                console.log(bookErr);
                return;
            }
            console.log(`${bookDocs.length} books created`);
            console.log('done');
            finish();
        });
        console.log(`${authorDocs.length} authors created`);
    });
    // console.log('done');
};

const getFiles = (folderNames) => {
    const xmlObjects = [];
    let counter = folderNames.length;
    console.log('reading files ...');
    folderNames.forEach((filename, i) => {
        try {
            const xml = fs.readFileSync(`./cache/epub/${filename}/pg${filename}.rdf`).toString();
            parseString(xml, (err, res) => {
                if (err) {
                    console.log(err);
                    counter -= 1;
                    if (counter === 0) {
                        nextStep(xmlObjects);
                    }
                } else {
                    printProgress(i / folderNames.length);
                    xmlObjects.push(res);
                    counter -= 1;
                    if (counter === 0) {
                        nextStep(xmlObjects);
                    }
                }
            });
        } catch (e) {
            console.log(`failed: ${filename}`);
            console.log(e);
            counter -= 1;
            if (counter === 0) {
                nextStep(xmlObjects);
            }
        }
    });
};

const start = async () => {
    await mongoose.connect('mongodb://localhost/semweblibrary');
    await Books.remove({});
    console.log('removed all books');
    await Authors.remove({});
    console.log('removed all authors');

    let folderNames = fs.readdirSync('./cache/epub');

    folderNames = folderNames.slice(0, numberBooks);
    console.log(folderNames.length);
    getFiles(folderNames);
};

start();
