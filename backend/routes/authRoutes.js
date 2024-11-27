const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  getAdmin,
  initiateResetPassword,
  verifyResetPasswordOTP,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/get-admin',protect, getAdmin);   
router.post('/reset-password/initiate', initiateResetPassword);
router.post('/reset-password/verify-otp',verifyResetPasswordOTP);
router.post('/reset-password/reset', resetPassword);
router.get('/logout', protect, logout);

module.exports = router;