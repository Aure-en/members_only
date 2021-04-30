const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

// GET Sign up
router.get('/signup', userController.user_create_get);

// POST Sign up
router.post('/signup', userController.user_create_post);

module.exports = router;
