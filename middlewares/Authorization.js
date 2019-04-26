
const createError = require('http-errors');
const adminModel = require('../models/admin');
const userModel = require('../models/user');

const getAdminAbilities = require('../abilities/admin');
const getUserAbilities = require('../abilities/user');


module.exports = async (req, res, next) => {
    // debugger;
    try {
        //check if the admin sent token
        if (!req.headers.authorization)
            return next(createError(401));
        // don't forget router.use(userAuthorization) in router/user

        //check if token is valid 
        const [, token] = req.headers.authorization.split(' ');
        // retrieve admin  or user
        const admin = await adminModel.verifyToken(token);
        const user = await userModel.verifyToken(token);
        let authUser = admin || user;
        if (!authUser)
            next(createError(401));

        // attach current authorized user to request 
        req.user = authUser;

        req.user.Abilities = admin ? getAdminAbilities() : getUserAbilities();

        // call next
        next();
    } catch (err) {
        next(createError(401));
    }
}
