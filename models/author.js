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
    photoURL: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'category'
    },
    dateOfCreation: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('author', authorSchema);