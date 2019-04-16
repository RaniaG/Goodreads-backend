var express = require('express');
const router = express.Router();
const multer = require('multer');
const createError = require('http-errors');
// const fs = require('fs');

const UserModel = require('../models/user');
const upload = multer({ dest: 'assets/photos/profile/' });

router.post('/', upload.single('photo'), async function (req, res, next) {
  try {
    const user = await UserModel.create({ ...req.body, photo: req.file ? { url: req.file.path, encoding: req.file.mimetype } : null });
    const token = await user.generateToken();
    res.send(token);
  } catch (e) {
    next(createError(400, 'invalid user data'));
  }
});

// router.get('/')
// fs.readFile(req.file.path, (err, data) => {
//   res.setHeader('Content-Type', `${req.file.mimetype}; charset=utf-8`);
//   if (err) {
//     res.statusCode = 400;
//     res.end('file not found');
//   }
//   else {
//     res.statusCode = 200;
//     res.end(data);
//   }
// });

module.exports = router;
