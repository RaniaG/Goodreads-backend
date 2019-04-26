var express = require('express');
var router = express.Router();
const AdminModel = require('../models/admin');

router.post('/', async function (req, res, next) {
    debugger;
    try {
        const admin = await AdminModel.findOne({ username: req.body.username });
        if (!await admin.verifyPassword(req.body.password)) throw 'error';
        const token = await admin.generateToken();
        res.send(token);
    } catch (e) {
        next(createError(401, 'invalid credentials'));
    }
})


module.exports = router;
