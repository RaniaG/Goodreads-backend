const categoryModel = require('../models/category');
var express = require('express');
const createError = require('http-errors');
var router = express.Router();

//get all categories
router.get('/', async (req, res, next) => {
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('getAll', 'category'))
        return next(createError(401, 'request denied'));
    const categories = await categoryModel.find({}).exec();
    res.send(categories.map(c => c.name));
});


//add category
router.post('/', async (req, res, next) => {
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('add', 'category'))
        return next(createError(401, 'request denied'));
    const currentCategory = new categoryModel({
        name: req.body.name
    });
    const category = await currentCategory.save();
    res.redirect('/categories');
});


//edit category
router.patch('/:id', async (req, res, next) => {
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('update', 'category'))
        return next(createError(401, 'request denied'));
    // const categories = await categoryModel.find({}).exec();
    // const currentCategory = categories.find(c => String(c._id) === String(req.params.id));
    // currentCategory.name = req.body.name;
    // console.log(currentCategory.name);
    // res.redirect('/categories');

    try {
        await categoryModel.findByIdAndUpdate(req.params.id, { name: req.body.name });
        res.sendStatus(200);
    }
    catch (err) {
        next(createError(400, 'id not found'));
    }
});


//delete category
router.delete('/:id', async (req, res, next) => {
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('delete', 'category'))
        return next(createError(401, 'request denied'));
    // const categories = await categoryModel.find({}).exec();
    // const currentCategoryIndex = categories.find(c => String(c._id) === String(req.params.id));
    // categories.splice(currentCategoryIndex, 1);
    // res.redirect('/categories');

    try {
        await categoryModel.findByIdAndDelete(req.params.id);
        res.sendStatus(200);
    }
    catch (err) {
        next(createError(400, 'id not found'));
    }
});


module.exports = router;