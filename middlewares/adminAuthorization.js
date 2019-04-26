
const createError = require('http-errors');
const adminModel = require('../models/admin');
module.exports = async (req , res , next) => {
    try{
        //check if the admin sent token
        if( !req.headers.authorization) 
            return next(createError(401));
            // don't forget router.use(userAuthorization) in router/user
    
        //check if token is valid 
        const [, token] = req.headers.authorization.split(' ');
        // retrieve admin 
        const admin = await adminModel.verifyToken(token);
        if(!admin)  next(createError(401));
    
        // attach current admin to request 
        req.admin = admin;
        // call next
        next();
    } catch(err){
        next(createError(401));
    }
}