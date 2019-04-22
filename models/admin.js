const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');

const saltRounds = 7;

const signPromise = util.promisify(jwt.sign);
const verifyToken = util.promisify(jwt.verify);
const secretKey = 'secretKey';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: /^[a-zA-Z ]+[a-zA-Z]$/,
        minlength: 3,
    },
    username: {
        type: String,
        required: true,
        //a username must only consist of either letters, numbers, periods and underscores
        match: /^(?!.*__.*)(?!.*\.\..*)[a-z0-9_.]+$/,
        unique: true,
        minlength: 5,
    },
    password: {
        type: String,
        required: true,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
        minlength: 8,
        hide: true
    }
});

//"this" is the currentAdmin
adminSchema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, saltRounds);
});

adminSchema.method('verifyPassword', async function (password) {
    return bcrypt.compare(password, this.password);
});

adminSchema.method('generateToken', function () {
    return signPromise({ id: this._id }, secretKey, { expiresIn: '10h' })
});


adminSchema.static('verifyToken', async function (token) {
    const decoded = await verifyToken(token, secretKey);
    const id = decoded._id;
    return this.findById(id);
})

const adminModel = mongoose.model('admin', adminSchema);
module.exports = adminModel;