const mongoose = require('mongoose');
const validator = require('validator');
const mongooseHidden = require('mongoose-hidden')()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');

const jwtSignPromise = util.promisify(jwt.sign);
const jwtVerifyPromise = util.promisify(jwt.verify);

const jwtKey = 'secretKey';
const saltRounds = 7;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: /^[a-zA-Z ]+[a-zA-Z]$/,
        minlength: 2
    },
    photo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'image'
    },
    email: {
        type: String,
        required: true,
        validate: validator.isEmail,
        unique: true
    },
    password: {
        type: String,
        required: true,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
        minlength: 8,
        hide: true
    },
    dateJoined: {
        type: Date,
        default: Date.now,
        hide: true
    }
})



userSchema.pre('save', async function () {
    const hash = await bcrypt.hash(this.password, saltRounds);
    this.password = hash;
}
)

userSchema.method('verifyPassword', async function (password) {
    return bcrypt.compare(password, this.password);
})

userSchema.method('generateToken', function () {
    return jwtSignPromise({ id: this._id }, jwtKey, { expiresIn: '2d' })
})
userSchema.static('verifyToken', async function (token) {
    const user = await jwtVerifyPromise(token, jwtKey);
    return this.findById(user.id).populate('photo');
})

userSchema.plugin(mongooseHidden, { hidden: { _id: false } }); //to send user id
const model = mongoose.model('users', userSchema);
module.exports = model

// model.create({ name: 'sfdfara', email: 'sarsdfsda@gmail.com', password: "abc_ABC%123" });
