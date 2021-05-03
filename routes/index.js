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

// GET Log in
router.get('/login', userController.user_login_get);

// POST Log in
router.post('/login', userController.user_login_post);

// GET Log out
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// GET Join Private Club
router.get('/join', userController.user_join_get);

// POST Join Private Club
router.post('/join', userController.user_join_post);

module.exports = router;
