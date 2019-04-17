var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var autherSchema = new Schema({
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