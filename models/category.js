const mongoose = require('mongoose');

const chategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
    },
    dateOfCreation: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const categoryModel = mongoose.model('Category', chategorySchema);
module.exports = categoryModel;