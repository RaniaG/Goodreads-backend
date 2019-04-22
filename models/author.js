var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authorSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 25
    },
    dateOfBirth: {
        type: Date,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'category'
    },
    dateOfCreation: {
        type: Date,
        default: Date.now
    },
    usersRatings: [Number],
    rating: {
        type: Number,
        max: 5
    }
});
module.exports = mongoose.model('author', authorSchema);