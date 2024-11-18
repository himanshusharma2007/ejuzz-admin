const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', protect, logout);

module.exports = router;