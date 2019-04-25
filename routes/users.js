var express = require('express');
const router = express.Router();
const multer = require('multer');
const createError = require('http-errors');
const fs = require('fs');
var path = require('path');

const UserModel = require('../models/user');
const upload = multer({ dest: 'assets/photos/profile/' });

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

//get user photo
router.get('/photo', async function (req, res, next) {
  debugger;
  const userPhoto = {
    path: 'assets/photos/profile/2cfd11f6447d4c60a9068359d0f911b7',
    encoding: 'image/svg+xml'
  }
  fs.readFile(userPhoto.path, (err, data) => {
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
  const user = {
    _id: 'adsasd'
  }
  try {
    const photo = { url: req.file.path, encoding: req.file.mimetype };
    await UserModel.findByIdAndUpdate(user._id, photo, { useFindAndModify: false, runValidators: true });
    res.sendStatus(200);
  } catch (err) {
    next(createError(400));
  }
})

module.exports = router;
