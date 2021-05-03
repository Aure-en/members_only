const async = require('async');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
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
  body('confirmation')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Password confirmation must be specified.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject('Passwords do not match.');
      }
      return true;
    }),

  // Check database to see if name is already taken
  (req, res, next) => {
    const errors = validationResult(req);
    async.waterfall([
      function (callback) {
        if (!req.body.username) {
          callback();
        } else {
          User.findOne({ username: req.body.username }).exec((err, result) => {
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
          return;
        }

        // Data form is valid
        // Create an User object with username and hashed password
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
          new User({
            username: req.body.username,
            password: hashedPassword,
            membership: 'user',
          }).save((err) => {
            if (err) return next(err);
            passport.authenticate('local', {
              successRedirect: '/',
              failureRedirect: '/',
            });
          });
        });
      },
    ]);
  },
];

// Display User Join Form on GET
exports.user_join_get = function (req, res) {
  console.log(req.user);
  res.render('join');
};

// Display User Join Form on POST
exports.user_join_post = [
  // Validate and sanitize fields
  body('password', 'Password must be specified').trim().isLength({ min: 1 }).escape(),
  body('password').custom((value) => {
    if (value !== process.env.SECRET_PASSWORD) {
      return Promise.reject('Sorry, this is not the right password.');
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors, render the form with errors and previous input.
      res.render('join', { errors: errors.array(), password: req.body.password });
      return;
    }

    // Right password, update the user and redirect.
    User.findByIdAndUpdate(req.user.id, { membership: 'member' }, {}, (err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  },
];

// Display User Log in Form on GET
exports.user_login_get = function (req, res) {
  res.render('login');
};

// Display User Log in Form on POST
exports.user_login_post = [
  // Validate and sanitize fields
  body('username', 'Username must be specified.').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password must be specified.').trim().isLength({ min: 1 }).escape(),
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
];
