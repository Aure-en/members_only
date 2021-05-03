const async = require('async');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Message = require('../models/message');

// Display Message Create Form on GET
exports.message_create_get = function (req, res) {
  res.render('message/create');
};

// Display Message Create Form on POST
exports.message_create_post = [
  // Validate and sanitize fields
  body('title', 'Title must be specified.').trim().isLength({ min: 1 }),
  body('text', 'Text must be specified.').trim().isLength({ min: 1 }),

  (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date(),
      author: res.locals.currentUser._id,
    });

    if (!errors.isEmpty()) {
      // There are errors, re-render the form with the error messages.
      res.render('message/create', { errors: errors.array(), message });
      return;
    }

    // There are no errors. Save the message.
    message.save((err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  },
];
