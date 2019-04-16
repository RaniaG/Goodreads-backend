const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/goodreads', { useNewUrlParser: true, autoIndex: true, useCreateIndex: true });
