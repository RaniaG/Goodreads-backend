
const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();
var mongoosePaginate = require('mongoose-paginate');

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
    photoURL: {
        type: String
    },
    publishDate: {
        type: Date,
        // required: true
    },
    userInfo: { //must be added so that it shows up in the sent request
        rating: {
            type: Number
        },
        status: {
            type: Number
        }
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
bookSchema.plugin(mongoosePaginate);
const bookModel = mongoose.model("books", bookSchema);

module.exports = bookModel;