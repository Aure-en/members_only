const async = require('async');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { format } = require('date-fns');
const Message = require('../models/message');
const User = require('../models/user');

// List all messages
exports.message_list = function (req, res, next) {
  async.parallel({
    users(callback) {
      User.countDocuments({ membership: 'user' }, callback);
    },
    members(callback) {
      User.countDocuments({ membership: 'member' }, callback);
    },
    admins(callback) {
      User.countDocuments({ membership: 'admin' }, callback);
    },
    messages(callback) {
      Message.find().populate('author').exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    res.render('index', {
      users: results.users,
      members: results.members,
      admins: results.admins,
      messages: results.messages,
      format,
    });
  });
};

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

// Delete Message GET
exports.message_delete_get = function (req, res, next) {
  Message.findById(req.params.id).populate('author').exec((err, message) => {
    if (err) return next(err);
    if (!message) {
      const err = new Error('Message not found');
      err.status = 404;
      return next(err);
    }
    // Successful so render
    res.render('message/delete', { message, format });
  });
};

// Delete Message POST
exports.message_delete_post = function (req, res, next) {
  Message.findByIdAndRemove(req.params.id, (err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};
