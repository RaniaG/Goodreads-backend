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
        type: Number,
        required: true,
        unique: true
    },
    dateOfCreation: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        max: 5
    }
});
module.exports = mongoose.model('author', authorSchema);