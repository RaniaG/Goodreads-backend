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
    //for author and category filters
    if (Object.keys(filters).length > 0) {
        for (const key in filters) {
            if (filters.hasOwnProperty(key)) {
                query.$and.push({ [key]: filters[key] });
            }
        }
    }
    return query;
}

//get all books with filters
router.get('/:page', async function (req, res, next) {
    try {
        const user = req.user;
        //verify the user ability
        if (user.Abilities.cannot('getAll', 'books'))
            return next(createError(401, 'request denied'));

        //remove book status from query because book status is not in the books model
        let status = null;
        if (req.query.status) {
            status = +req.query.status;
            delete req.query.status;
        }

        //form a query from the filters
        const query = getBooksQuery(req.query);
        //pagination
        BooksModel.paginate(query, {
            select: '-rating.rateCount -rating.rateValue', //exclude these fields
            limit: 9,
            page: +req.params.page,
        }, async (err, result) => {
            if (err)
                return next(createError(400));

            //populate author and category for each book
            for (const el of result.docs) {
                await el.populate('author').execPopulate();
                await el.populate('category').execPopulate();
            }
            let books = result.docs
            if (user.type === 'user') {
                //populate the status for each book if its a user
                for (const e of result.docs) {
                    const userBook = await UserBooksModel.findOne({ user: user._id, book: e._id });
                    if (userBook)
                        e.userInfo = { rating: userBook.rating, status: userBook.status };
                }
                if (status) //filter based on status
                    books = result.docs.filter(e => {
                        return e.userInfo.status === status;
                    });
            }
            res.send({ ...result, docs: books });
        })
    } catch (err) {
        next(createError(500));
    }
});

//get logged in user's books
router.get('/mine/:page', async function (req, res, next) {
    // debugger;
    try {
        const loggedUser = req.user;
        if (loggedUser.Abilities.cannot('getOwn', 'books'))
            return next(createError(401, 'request denied'));

        UserBooksModel.paginate({ user: loggedUser._id }, {
            select: 'book status rating -_id',
            limit: 9,
            page: +req.params.page,
        }, async function (err, result) {
            if (err)
                next(createError(400));


            //populate book, author and category
            for (const el of result.docs) {
                await el.populate('book').execPopulate();
                await el.book.populate('author').execPopulate();
                await el.book.populate('category').execPopulate();
            }

            res.send(result);
        })
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
            .populate('author')
            .populate('category');
        //populate status and rating
        const userBook = await UserBooksModel.findOne({ user: loggedUser._id, book: req.params.id });
        if (userBook)
            e.userInfo = { rating: userBook.rating, status: userBook.status };
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
        const rate = +req.body.rating;
        const ratingQuery = !result || !result.rating ?
            { $inc: { "rating.rateCount": 1, "rating.rateValue": rate } } //first time rating
            : { $inc: { "rating.rateValue": (rate) - result.rating } }; //update rating

        updatedBook = await BooksModel.findByIdAndUpdate(req.params.id, ratingQuery, { useFindAndModify: false, runValidators: true, new: true });

        await UserBooksModel.findOneAndUpdate({ user: loggedUser._id, book: req.params.id }, { rating: rate }, { upsert: true, new: true });

        //calculate average
        await BooksModel.findByIdAndUpdate(req.params.id,
            { "rating.rateAverage": updatedBook.rating.rateValue / updatedBook.rating.rateCount }, { useFindAndModify: false, runValidators: true });
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
            await UserBooksModel.create({ user: loggedUser._id, book: req.params.id, status: +req.body.status });
        } else {
            await UserBooksModel.findByIdAndUpdate(userBook._id, { status: req.body.status }, { useFindAndModify: false, runValidators: true });
        }
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