const categoryModel = require('../models/category');
var express = require('express');
var router = express.Router();

//get all categories
router.get('/', async (req, res, next) => {
    const categories = await categoryModel.find({}).exec();
    res.send(categories.map(c => c.name));
});


//add category
router.post('/', async (req, res, next) => {
    const currentCategory = new categoryModel({
        name: req.body.name
    });
    const category = await currentCategory.save();
    res.redirect('/categories');
});


//edit category
router.patch('/:id', async (req, res, next) => {
    const categories = await categoryModel.find({}).exec();
    const currentCategory = categories.find(c => String(c._id) === String(req.params.id));
    currentCategory.name = req.body.name;
    // console.log(currentCategory.name);
    res.redirect('/categories');
});


//delete category
router.delete('/:id', async (req, res, next) => {
    const categories = await categoryModel.find({}).exec();
    const currentCategoryIndex = categories.find(c => String(c._id) === String(req.params.id));
    categories.splice(currentCategoryIndex, 1);
    res.redirect('/categories');
});


module.exports = router;