var express = require('express');
const router = express.Router();
const multer = require('multer');
const createError = require('http-errors');
const fs = require('fs');
var path = require('path');

const UserModel = require('../models/user');
const upload = multer({ dest: 'assets/photos/profile/' });
const Authorization = require('../middlewares/Authorization');


//sign up
router.post('/', upload.single('photo'), async function (req, res, next) {
  debugger;
  try {
    const user = await UserModel.create({ ...req.body, photo: req.file ? { url: req.file.path, encoding: req.file.mimetype } : null });
    const token = await user.generateToken();
    res.send(token);
  } catch (e) {
    next(createError(400, 'invalid user data'));
  }
});

router.post('/login/', async function (req, res, next) {
  debugger;
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
    // const user = await UserModel.findById(req.loggedUser.id);
    res.send(loggedUser);
  }
  catch (e) {
    next(createError(404, 'user not found'));
  }
});

//get user photo
router.get('/photo', async function (req, res, next) {
  const loggedUser = req.user;
  if (loggedUser.Abilities.cannot('getPhoto', 'user'))
    return next(createError(401, 'request denied'));
  debugger;
  const { photo } = loggedUser;
  fs.readFile(photo.path, (err, data) => {
    debugger;
    if (err) {
      //fall back image
      fs.readFile(path.join('assets/photos/profile/', 'index.png'), (err, data) => {
        debugger;
        if (err) {
          next(createError(500));
        }
        res.setHeader('Content-Type', 'image/png; charset=utf-8');
        res.send(data);
      });
    }
    else {
      res.setHeader('Content-Type', `${userPhoto.encoding}; charset=utf-8`);
      res.send(data);
    }
  });
})

//update user photo
router.patch('/photo', upload.single('photo'), async function (req, res, next) {
  //havent tested this route yet

  try {
    const loggedUser = req.user;
    if (loggedUser.Abilities.cannot('updatePhoto', 'user'))
      return next(createError(401, 'request denied'));
    const photo = { url: req.file.path, encoding: req.file.mimetype };
    await UserModel.findByIdAndUpdate(loggedUser._id, photo, { useFindAndModify: false, runValidators: true });
    res.sendStatus(200);
  } catch (err) {
    next(createError(400));
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
    await UserModel.updateOne({ _id: req.user._id }, req.body);
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
