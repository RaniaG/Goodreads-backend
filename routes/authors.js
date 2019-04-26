const express = require('express');
const Author = require('./../models/author');
const router = express.Router();
const createError = require('http-errors');

//add author
router.post('/', (req, res, next) => {
    Author
        .create(req.body)
        .then(user => res.send(user))
        .catch(err => next(createError(400, err.message)))
});

//get all authors
router.get('/', async function (req, res, next) {
    try {
        const authors = await Author.find()
            .populate('category', 'name');
        res.send(authors);
    } catch (error) {
        next(createError(500));
    }
});

//get author by id
router.get('/:id', async function (req, res, next) {
    try {
        const authors = await Author.findById(req.params.id)
            .populate('category', 'name');
        res.send(authors);
    } catch (error) {
        next(createError(500));
    }
});

//delete author
router.delete('/:id', (req, res, next) => {
    Author
        .findByIdAndDelete(req.params.id)
        .exec()
        .then(author => res.send(author))
        .catch(err => next(createError(400, "Invalid Author")))
});

//edit author
router.patch('/:id', (req, res, next) => {
    //debugger;
    Author
        .findByIdAndUpdate(req.params.id, req.body, { new: true })
        .exec()
        .then(user => res.send(user))
        .catch(err => next(createError(400, "Invalid Author Data")))
})

module.exports = router;  