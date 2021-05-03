const async = require('async');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');

// Display User Sign up Form on GET
exports.user_create_get = function (req, res) {
  res.render('user/signup');
};

// Display User Sign up Form on POST
exports.user_create_post = [

  // Validate and sanitize fields
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username must be specified.')
    .isAlphanumeric()
    .withMessage("Username's characters must be alphanumeric."),
  body('password', 'Password must be specified.').trim().isLength({ min: 1 }),
  body('confirmation')
    .trim()
    .isLength({ min: 1 })
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
          res.render('user/signup', {
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
            res.redirect('/login');
          });
        });
      },
    ]);
  },
];

// Display User Join Form on GET
exports.user_join_get = function (req, res) {
  res.render('user/join');
};

// Display User Join Form on POST
exports.user_join_post = [
  // Validate and sanitize fields
  body('password', 'Password must be specified').trim().isLength({ min: 1 }).escape(),
  body('password').custom((value) => {
    if (value !== process.env.CLUB_PASSWORD && value !== process.env.ADMIN_PASSWORD) {
      return Promise.reject('Sorry, this is not the right password.');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors, render the form with errors and previous input.
      res.render('user/join', { errors: errors.array(), password: req.body.password });
      return;
    }

    // Right password, update the user and redirect.
    if (req.body.password === process.env.CLUB_PASSWORD) {
      User.findByIdAndUpdate(req.user.id, { membership: 'member' }, {}, (err) => {
        if (err) return next(err);
        res.redirect('/');
      });
    } else if (req.body.password === process.env.ADMIN_PASSWORD) {
      User.findByIdAndUpdate(req.user.id, { membership: 'admin' }, {}, (err) => {
        if (err) return next(err);
        res.redirect('/');
      });
    }
  },
];

// Display User Log in Form on GET
exports.user_login_get = function (req, res) {
  res.render('user/login');
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
