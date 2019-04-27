var express = require('express');
var router = express.Router();
const createError = require('http-errors');

const BooksModel = require('../models/book');
const UserBooksModel = require('../models/userBooks');
const UserModel = require('../models/user');






function getBooksQuery(filters) {
    let query = Object.keys(filters).length === 0 ? {} : { $and: [] }; //query for db
    const name = filters.name ? { $regex: `.*${filters.name}.*` } : null; //get all books which include a name
    const rating =
        +filters.rating ? //get rating rounded
            [
                { 'rating.rateAverage': { $lt: +filters.rating + 0.5 } },
                { 'rating.rateAverage': { $gt: +filters.rating - 0.5 } }
            ] : null;

    if (rating) {
        query.$and = [...rating];
        delete filters.rating; //so that it wont be added again to query array
    }
    name && query.$and.push({ name }); //set name query if it exsts
    !Object.keys(filters).length === 0 && query.$and.push([filters]); //for author and category filters
    return query;
}

//get all books with filters
router.get('/', async function (req, res, next) {
    debugger;
    try {
        const user = req.user;
        if (user.Abilities.cannot('getAll', 'books'))
            return next(createError(401, 'request denied'));
        const results = await BooksModel.find(getBooksQuery(req.query), { 'rating.rateCount': 0, 'rating.rateValue': 0 })
            .populate('userInfo', 'status rating -_id')//
            .populate('author')
            .populate('category')
            ;
        res.send(results);
    } catch (err) {
        next(createError(500));
    }
});

//get logged in user's books
router.get('/mine/', async function (req, res, next) {
    // debugger;
    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('getOwn', 'books'))
            return next(createError(401, 'request denied'));
        const results = await UserBooksModel.find({ user: loggedUser._id }, { book: 1, _id: 0 })
            .populate({
                path: 'book',
                match: getBooksQuery(req.query),
                // select: 'name -_id',
            });
        for (const el of results) {
            debugger;
            await el.book.populate('author').execPopulate();
            await el.book.populate('category').execPopulate();
            await el.book.populate('userInfo', 'status rating -_id').execPopulate();

        }
        res.send(results);
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
});

//get book by id
router.get('/:id', async function (req, res, next) {
    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('getById', 'books'))
            return next(createError(401, 'request denied'));
        // debugger;
        const results = await BooksModel.findById(req.params.id, { 'rating.rateCount': 0, 'rating.rateValue': 0 })
            .populate('userInfo', 'status rating -_id')
            .populate('author')
            .populate('category');
        res.send(results);
    } catch (err) {
        next(createError(500));
    }
})

//rate a book
router.post('/rate/:id', async function (req, res, next) {
    //user can also change his previous rating through this route

    debugger;
    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('rate', 'books'))
            return next(createError(401, 'request denied'));
        const result = await UserBooksModel.findOne({ user: loggedUser._id, book: req.params.id });
        let updatedBook;
        //check if first time rating for this book
        const ratingQuery = !result || !result.rating ?
            { $inc: { "rating.rateCount": 1, "rating.rateValue": +req.body.rating } } //first time rating
            : { $inc: { "rating.rateValue": (+req.body.rating) - result.rating } }; //update rating

        updatedBook = await BooksModel.findByIdAndUpdate(req.params.id, ratingQuery, { useFindAndModify: false, runValidators: true, new: true });

        const userBook = await UserBooksModel.findOneAndUpdate({ user: loggedUser._id, book: req.params.id }, { rating: req.body.rating }, { upsert: true, new: true });

        //calculate average
        await BooksModel.findByIdAndUpdate(req.params.id,
            { "rating.rateAverage": updatedBook.rating.rateValue / updatedBook.rating.rateCount, userInfo: userBook._id }, { useFindAndModify: false, runValidators: true });
        res.sendStatus(200);
    } catch (err) {
        next(createError(500));
    }
})

//change book status
router.post('/status/:id', async function (req, res, next) {

    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('updateStatus', 'books'))
            return next(createError(401, 'request denied'));
        const userBook = await UserBooksModel.findOne({ user: loggedUser._id, book: req.params.id });
        if (!userBook) {
            userBook = await UserBooksModel.create({ user: loggedUser._id, book: req.params.id, status: req.body.status });
        } else {
            await UserBooksModel.findByIdAndUpdate(userBook._id, { status: req.body.status }, { useFindAndModify: false, runValidators: true });
        }
        await BooksModel.findByIdAndUpdate(req.params.id, { userInfo: userBook._id }, { useFindAndModify: false, runValidators: true });
        res.sendStatus(200);
    } catch (e) {
        next(createError(500));
    }
})

//add a book
router.post('/', async function (req, res, next) {
    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('add', 'books'))
            return next(createError(401, 'request denied'));
        await BooksModel.create(req.body);
        res.sendStatus(200);
    } catch (e) {
        next(createError(400, 'invalid book data'));
    }
});


//edit a book
router.patch('/:id', async function (req, res, next) {
    debugger;
    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('update', 'books'))
            return next(createError(401, 'request denied'));
        const book = req.body;
        book.rating && delete book.rating;
        book.userInfo && delete book.userInfo;
        book.creationDate && delete book.creationDate;
        await BooksModel.findByIdAndUpdate(req.params.id, book, { useFindAndModify: false, runValidators: true });
        res.sendStatus(200);
    } catch (e) {
        next(createError(400, 'invalid book data'));
    }
});

//delete a book
router.delete('/:id', async function (req, res, next) {
    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('delete', 'books'))
            return next(createError(401, 'request denied'));
        //delete the book
        await BooksModel.findByIdAndDelete(req.params.id);
        //delete all references to it
        await UserBooksModel.deleteMany({ book: req.params.id });
        res.sendStatus(200);
    } catch (e) {
        next(createError(400, 'invalid book'));
    }
});
module.exports = router;