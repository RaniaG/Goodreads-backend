var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const createError = require('http-errors');
var cors = require('cors')
require('./db');



// var indexRouter = require('./routes/index');
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

// app.use('/', indexRouter);


app.use('/users', usersRouter);
// app.use('/admin', adminRouter);
<<<<<<< HEAD
app.use('/categories', categoriesRouter);
// app.use('/books', booksRouter);
=======
// app.use('/categories', categoriesRouter);
app.use('/books', booksRouter);
>>>>>>> 7221de70d0a64305d44dff75541ef9458c907f42
// app.use('/authors', authorsRouter);

app.use((req, res, next) => {
    //route not found
    debugger;
    next(createError(404, 'Page not found'));
})


app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err);
});

module.exports = app;
