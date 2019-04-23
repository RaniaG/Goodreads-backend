
const mongoose = require('mongoose');
var integerValidator = require('mongoose-integer');

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
        enum: [0, 1, 2, 3],
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
const userBooksModel = mongoose.model("userBooks", userBooksSchema);

module.exports = userBooksModel;