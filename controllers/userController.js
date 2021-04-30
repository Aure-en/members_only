const async = require('async');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Display User Sign up Form on GET
exports.user_create_get = function (req, res) {
  res.render('signup');
};

// Display User Sign up Form on POST
exports.user_create_post = [

  // Validate and sanitize fields
  body('username', 'Username must be specified.').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password must be specified.').trim().isLength({ min: 1 }).escape(),

  // Check database to see if name is already taken
  (req, res, next) => {
    const errors = validationResult(req);
    async.waterfall([
      function (callback) {
        if (!req.body.username) {
          callback();
        } else {
          User.findOne({ username: req.body.username }).exec((err, result) => {
            if (err) return next(err);
            if (result) {
              errors.errors.push({
                value: '',
                param: 'username',
                msg: 'Username already in use.',
                location: 'body',
              });
            }
            callback();
          });
        }
      },

      // Check for errors
      function (callback) {
        if (!errors.isEmpty()) {
          // There are errors. Render form again with values and errors.
          res.render('signup', {
            user: req.body,
            errors: errors.array(),
          });
        }
      },

      // Data form is valid
      // Create an User object with username and hashed password
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        new User({
          username: req.body.username,
          password: hashedPassword,
        }).save((err) => {
          if (err) return next(err);
          res.redirect('/');
        });
      }),

    ]);
  },
];
