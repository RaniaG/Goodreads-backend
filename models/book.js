
const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 20
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'author'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'category'
    },
    creationDate: {
        type: Date,
        default: Date.now,
        hide: true
    },
    publishDate: {
        type: Date,
        // required: true
    },
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userBooks',
    }
    , rating: {
        rateCount: {
            type: Number
        },
        rateValue: {
            type: Number
        },
        rateAverage: {
            type: Number
        }
    }
})
bookSchema.plugin(mongooseHidden, { hidden: { _id: false } });
const bookModel = mongoose.model("books", bookSchema);

module.exports = bookModel;