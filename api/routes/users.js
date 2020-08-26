const express = require('express');
const routerUser = express.Router();
const checkAuth = require('../middleware/check-auth');

const UsersController =  require('../controllers/users');

routerUser.post('/signup', UsersController.signUp);

routerUser.post('/signin', UsersController.signIn);

routerUser.get('/currentUser', checkAuth, UsersController.getCurrentUser);

module.exports = routerUser