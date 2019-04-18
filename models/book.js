
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 20
    },
    authorId: {
        type: Number,
        required: true,
    },
    categoryId: {
        type: Number,
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    publishDate: {
        type: Date,
        // required: true
    },
    status: {
        default: 0,
    },
    rating: {
        default: 0,
    }
})

const bookModel = mongoose.model("books" , bookSchema);

module.exports = bookModel;