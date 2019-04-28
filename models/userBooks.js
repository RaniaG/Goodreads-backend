
const mongoose = require('mongoose');
var integerValidator = require('mongoose-integer');
var mongoosePaginate = require('mongoose-paginate');


const userBooksSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'books',
        required: true
    },
    status: {
        type: Number,
        min: 0,
        max: 3,
        integer: true

    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    }
})
userBooksSchema.index({ user: 1, book: 1 }, { unique: true });
userBooksSchema.plugin(integerValidator);
userBooksSchema.plugin(mongoosePaginate);

const userBooksModel = mongoose.model("userBooks", userBooksSchema);

module.exports = userBooksModel;