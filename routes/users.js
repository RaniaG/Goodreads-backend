var express = require('express');
const router = express.Router();
const multer = require('multer');
const createError = require('http-errors');
const fs = require('fs');
var path = require('path');

const UserModel = require('../models/user');
const ImageModel = require('../models/image');
const upload = multer({ dest: 'assets/photos/profile/' });
const Authorization = require('../middlewares/Authorization');


//sign up
router.post('/', upload.single('photo'), async function (req, res, next) {
  try {
    let addedImage;
    if (req.file) //user added an image
    {
      const photo = {};
      photo.data = fs.readFileSync(req.file.path);
      photo.contentType = req.file.mimetype;
      //add it to db
      addedImage = await ImageModel.create(photo);
    }
    const user = await UserModel.create({ ...req.body, photo: req.file ? addedImage._id : null });
    const token = await user.generateToken();
    //remove the created file on disk
    req.file && fs.unlink(req.file.path, (err) => {
    });
    res.send(token);
  } catch (e) {
    next(createError(400, e));
  }
});
/** login */
router.post('/login/', async function (req, res, next) {
  // debugger;
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!await user.verifyPassword(req.body.password)) throw 'error';
    const token = await user.generateToken();
    res.send(token);
  } catch (e) {
    next(createError(401, 'invalid credentials'));
  }
})

router.use(Authorization);


/* GET user data. */
router.get('/', async (req, res, next) => {
  try {
    // debugger;
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('getInfo', 'user'))
      return next(createError(401, 'request denied'));
    res.send(loggedUser);
  }
  catch (e) {
    next(createError(404, 'user not found'));
  }
});


//update user photo
router.patch('/photo', upload.single('photo'), async function (req, res, next) {
  try {
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('updatePhoto', 'user'))
      return next(createError(401, 'request denied'));

    const photo = {};
    photo.data = fs.readFileSync(req.file.path);
    photo.contentType = req.file.mimetype;
    if (loggedUser.photo === null) //user doesnt have photo
    {
      //add it to db
      const addedImage = await ImageModel.create(photo);
      loggedUser.photo = addedImage._id;
      loggedUser.save();
    } else {//user want to change photo
      await ImageModel.findByIdAndUpdate(loggedUser.photo, photo, { useFindAndModify: false });
    }
    //remove the created file on disk
    req.file && fs.unlink(req.file.path, (err) => {
    });
    res.sendStatus(200);
  } catch (e) {
    next(createError(400, e));
  }

})


/* change password of user */
router.patch('/password', async (req, res, next) => {
  try {
    debugger;
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('updatePassword', 'user'))
      return next(createError(401, 'request denied'));
    if (!await loggedUser.verifyPassword(req.body.password)) throw 'error';
    loggedUser.password = req.body.newPassword;
    await loggedUser.save(); //normal update functions dont call save
    res.sendStatus(202);
  }
  catch (e) {
    next(createError(400, 'invalid password'));
  }
});

/* update a user */
router.patch('/', async (req, res, next) => {
  try {
    debugger;
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('update', 'user'))
      return next(createError(401, 'request denied'));
    delete req.body.password; //to prevent changing of password except through pass route 
    delete req.body.photo; //to prevent changing of photo 
    await UserModel.updateOne({ _id: req.user._id }, req.body, { runValidators: true });
    res.sendStatus(202);
  }
  catch (e) {
    next(createError(400, 'invalid data. update failed'));
  }
});

/* delete a user */
router.delete('/', async (req, res, next) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('delete', 'user'))
      return next(createError(401, 'request denied'));

    await UserModel.deleteOne({ _id: loggedUser._id });
    res.sendStatus(200);
  }
  catch (e) {
    next(createError(400, 'invalid user. delete failed'));
  }
});


module.exports = router;
