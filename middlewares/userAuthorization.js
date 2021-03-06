
const createError = require('http-errors');
const userModel = require('../models/user');

const getUserAbilities = require('../abilities/user');

module.exports = async (req, res, next) => {
    try {
        //check if the user sent token
        if (!req.headers.authorization)
            return next(createError(401));
        // don't forget router.use(userAuthorization) in router/user

        //check if token is valid 
        const [, token] = req.headers.authorization.split(' ');
        // retrieve user 
        const user = await userModel.verifyToken(token);
        if (!user) next(createError(401));

        // attach current user to request 
        req.user = user;
        //attach abilities to user
        req.user.Abilities = getUserAbilities();
        // call next
        next();
    } catch (err) {
        next(createError(401));
    }
}