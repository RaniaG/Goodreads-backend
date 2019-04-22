
const mongoose = require('mongoose');

const userBooksSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'books',
        required: true
    },
    status: {
        type: Number,
        enum: [0, 1, 2, 3]
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    }
})
userBooksSchema.index({ userId: 1, authorId: 1 }, { unique: true });
const userBooksModel = mongoose.model("userBooks", userBooksSchema);

module.exports = userBooksModel;