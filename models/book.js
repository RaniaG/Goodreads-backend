
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 20
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'author'
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'category'
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    publishDate: {
        type: Date,
        // required: true
    },
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userBooks'
    }
    , usersRatings: [Number]
})

const bookModel = mongoose.model("books", bookSchema);

module.exports = bookModel;