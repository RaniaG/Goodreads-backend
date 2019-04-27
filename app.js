var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const createError = require('http-errors');
var cors = require('cors')
require('./db');
require('./CreateAndPopulateDB');
const Authorization = require('./middlewares/Authorization');




var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var authorsRouter = require('./routes/authors');
var booksRouter = require('./routes/books');
var categoriesRouter = require('./routes/categories');


var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use(Authorization);
app.use('/categories', categoriesRouter);
app.use('/books', booksRouter);
app.use('/authors', authorsRouter);

app.use((req, res, next) => {
    //route not found
    debugger;
    next(createError(404, 'Request not found'));
})


app.use((err, req, res, next) => {
    // debugger;
    res.status(err.status || 500);
    res.send(err);
});

module.exports = app;
